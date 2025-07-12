-- Phase 1: Critical Security Fixes (Alternative approach without vault extension)

-- Update the automation trigger function to remove hardcoded JWT
CREATE OR REPLACE FUNCTION public.trigger_automation_processing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://cigqptkxjxorlenvvets.supabase.co/functions/v1/process-automation-rules',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('timestamp', now()::text)
  );
END;
$$;

-- Add encrypted token storage columns
ALTER TABLE ad_accounts 
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- Add security audit columns to actions_log
ALTER TABLE actions_log 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_details JSONB DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO actions_log (
    user_id,
    action_type,
    target_type,
    target_id,
    action_details,
    ip_address,
    user_agent,
    status
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    event_type,
    'security_event',
    gen_random_uuid()::text,
    event_details,
    ip_addr,
    user_agent_str,
    'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for rate_limits
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type_param TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only check rate limits for authenticated users
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate window start time
  window_start_time := date_trunc('minute', now()) - (EXTRACT(minute FROM now())::INTEGER % window_minutes) * INTERVAL '1 minute';
  
  -- Get current attempts in this window
  SELECT COALESCE(attempts, 0) INTO current_attempts
  FROM rate_limits 
  WHERE user_id = auth.uid() 
    AND action_type = action_type_param 
    AND window_start = window_start_time;
    
  -- Check if limit exceeded
  IF current_attempts >= max_attempts THEN
    -- Log security event
    PERFORM log_security_event(
      'rate_limit_exceeded',
      jsonb_build_object(
        'action_type', action_type_param,
        'attempts', current_attempts,
        'max_attempts', max_attempts
      )
    );
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO rate_limits (user_id, action_type, attempts, window_start)
  VALUES (auth.uid(), action_type_param, 1, window_start_time)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET attempts = rate_limits.attempts + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add input validation function
CREATE OR REPLACE FUNCTION public.validate_account_input(
  account_id_param TEXT,
  account_name_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate account ID format (basic alphanumeric with some special chars)
  IF account_id_param !~ '^[a-zA-Z0-9_-]{1,100}$' THEN
    RAISE EXCEPTION 'Invalid account ID format';
  END IF;
  
  -- Validate account name (no script tags or excessive length)
  IF length(account_name_param) > 255 OR account_name_param ~ '<script|javascript:|data:' THEN
    RAISE EXCEPTION 'Invalid account name';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enhanced authentication log trigger
CREATE OR REPLACE FUNCTION public.log_authentication_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Log successful authentication
  PERFORM log_security_event(
    'authentication_success',
    jsonb_build_object(
      'user_id', NEW.id,
      'login_method', 'password'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;