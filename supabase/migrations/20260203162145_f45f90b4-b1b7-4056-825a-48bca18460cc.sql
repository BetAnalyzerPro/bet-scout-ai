-- Fix RLS warning by adding explicit deny policy for rate_limits
-- This table should only be accessed via service role (SECURITY DEFINER functions)

-- Policy that denies all access from authenticated users (only service role can access)
CREATE POLICY "No direct client access to rate_limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (false);

-- Also ensure security_logs cannot be inserted/updated/deleted by clients
CREATE POLICY "No client insert on security_logs"
ON public.security_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No client update on security_logs"
ON public.security_logs
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No client delete on security_logs"
ON public.security_logs
FOR DELETE
TO authenticated
USING (false);

-- Ensure subscription_events cannot be modified by clients
CREATE POLICY "No client insert on subscription_events"
ON public.subscription_events
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No client update on subscription_events"
ON public.subscription_events
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No client delete on subscription_events"
ON public.subscription_events
FOR DELETE
TO authenticated
USING (false);