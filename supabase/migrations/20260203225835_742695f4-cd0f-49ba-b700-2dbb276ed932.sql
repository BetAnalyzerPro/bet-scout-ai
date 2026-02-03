-- Update validate_plan_limit function to support elite plan
CREATE OR REPLACE FUNCTION public.validate_plan_limit(p_user_id uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Get limit based on plan (elite has unlimited = 999999)
  CASE v_profile.current_plan::text
    WHEN 'free' THEN v_limit := 1;
    WHEN 'intermediate' THEN v_limit := 2;
    WHEN 'advanced' THEN v_limit := 10;
    WHEN 'elite' THEN v_limit := 999999; -- Unlimited
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
$function$;