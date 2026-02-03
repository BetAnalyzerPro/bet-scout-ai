-- ============================================
-- SECURITY INFRASTRUCTURE FOR BET ANALYZER
-- ============================================

-- 1. Create enum for security event types
CREATE TYPE public.security_event_type AS ENUM (
  'login_attempt',
  'login_failed',
  'login_success',
  'logout',
  'rate_limit_exceeded',
  'plan_limit_exceeded',
  'suspicious_activity',
  'upload_rejected',
  'invalid_token',
  'unauthorized_access',
  'payment_webhook',
  'subscription_change',
  'account_blocked'
);

-- 2. Create enum for subscription status (for future payments)
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'canceled',
  'expired',
  'blocked',
  'pending'
);

-- 3. Security Logs Table
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type security_event_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warn', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for faster queries on user and event type
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_ip_address ON public.security_logs(ip_address);
CREATE INDEX idx_security_logs_severity ON public.security_logs(severity);

-- RLS for security_logs (only admins can read, service role can write)
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all logs
CREATE POLICY "Admins can read security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No direct insert/update/delete from client - only through service role

-- 4. Subscription Events Table (for payment webhooks)
CREATE TABLE public.subscription_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_id TEXT, -- Stripe/Kiwify subscription ID
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'kiwify', 'manual')),
  status subscription_status NOT NULL,
  plan_id TEXT,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'BRL',
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_external_id ON public.subscription_events(external_id);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at DESC);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscription events
CREATE POLICY "Users can view their own subscription events"
ON public.subscription_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Rate Limit Tracking Table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id or IP address
  action TEXT NOT NULL, -- 'login', 'analysis', 'signup', etc.
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No client access to rate_limits - only service role

-- 6. Function to check rate limit (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_count INTEGER,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  -- Calculate window start
  v_window_start := date_trunc('hour', now()) + 
    (floor(extract(minute FROM now()) / p_window_minutes) * p_window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO rate_limits (identifier, action, window_start, count)
  VALUES (p_identifier, p_action, v_window_start, 1)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET 
    count = rate_limits.count + 1,
    updated_at = now()
  RETURNING count INTO v_current_count;
  
  RETURN v_current_count <= p_max_count;
END;
$$;

-- 7. Function to validate user's plan limits (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.validate_plan_limit(
  p_user_id UUID,
  p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_limit INTEGER;
  v_used INTEGER;
  v_today DATE;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Get user profile
  SELECT current_plan, daily_analyses_used, last_analysis_reset
  INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'error', 'Profile not found',
      'limit', 0,
      'used', 0
    );
  END IF;
  
  -- Reset counter if new day
  IF v_profile.last_analysis_reset IS NULL OR v_profile.last_analysis_reset < v_today THEN
    UPDATE profiles 
    SET daily_analyses_used = 0, last_analysis_reset = v_today
    WHERE user_id = p_user_id;
    v_profile.daily_analyses_used := 0;
  END IF;
  
  -- Get limit based on plan
  CASE v_profile.current_plan
    WHEN 'free' THEN v_limit := 1;
    WHEN 'intermediate' THEN v_limit := 2;
    WHEN 'advanced' THEN v_limit := 10;
    ELSE v_limit := 1;
  END CASE;
  
  IF p_action = 'analysis' THEN
    IF v_profile.daily_analyses_used >= v_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'error', 'Daily limit reached',
        'limit', v_limit,
        'used', v_profile.daily_analyses_used
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'limit', v_limit,
    'used', v_profile.daily_analyses_used,
    'plan', v_profile.current_plan
  );
END;
$$;

-- 8. Function to increment analysis count (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_analysis_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    daily_analyses_used = daily_analyses_used + 1,
    last_analysis_reset = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- 9. Function to log security events (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type security_event_type,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, metadata, severity)
  VALUES (p_user_id, p_event_type, p_ip_address::inet, p_user_agent, p_metadata, p_severity)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 10. Scheduled cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - interval '24 hours';
END;
$$;

-- 11. Add plan_expires_at column to profiles for future subscription management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('stripe', 'kiwify', NULL));

-- 12. Create index for expired plans
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires_at ON public.profiles(plan_expires_at);

-- 13. Function to check if plan is active
CREATE OR REPLACE FUNCTION public.is_plan_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT current_plan, plan_expires_at
  INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Free plan is always active
  IF v_profile.current_plan = 'free' THEN
    RETURN true;
  END IF;
  
  -- Paid plans need valid expiration
  IF v_profile.plan_expires_at IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN v_profile.plan_expires_at > now();
END;
$$;