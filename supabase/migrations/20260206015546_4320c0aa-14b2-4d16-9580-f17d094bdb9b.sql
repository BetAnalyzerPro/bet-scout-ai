-- Add Stripe-related columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS plan_status text DEFAULT 'active';

-- Create index for faster lookups by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Add plan_key column to subscription_events for tracking which plan
ALTER TABLE public.subscription_events
ADD COLUMN IF NOT EXISTS plan_key text,
ADD COLUMN IF NOT EXISTS raw_event jsonb;

-- Update validate_plan_limit function to use the new plan names (basic, pro, elite)
-- The current function already handles the database enum values correctly
-- We'll add a helper function for plan mapping

CREATE OR REPLACE FUNCTION public.get_plan_daily_limit(p_plan text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Map database plan values to daily limits
  -- Database uses: free, intermediate, advanced, elite
  -- UI uses: free, basic, pro, elite
  CASE p_plan
    WHEN 'free' THEN RETURN 1;
    WHEN 'intermediate' THEN RETURN 2; -- Basic plan
    WHEN 'advanced' THEN RETURN 10; -- Pro plan
    WHEN 'elite' THEN RETURN 200; -- Elite plan (fair-use limit for anti-abuse)
    ELSE RETURN 1;
  END CASE;
END;
$$;

-- Create function to handle plan downgrade after payment failure
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Downgrade users with past_due or unpaid status for more than 7 days
  UPDATE profiles
  SET 
    current_plan = 'free',
    plan_status = 'expired',
    updated_at = now()
  WHERE 
    plan_status IN ('past_due', 'unpaid')
    AND updated_at < now() - interval '7 days'
    AND current_plan != 'free';
END;
$$;