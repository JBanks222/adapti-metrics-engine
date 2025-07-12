import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Input validation schemas
export const accountConnectionSchema = z.object({
  account_id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/, 'Invalid account ID format'),
  account_name: z.string().max(255, 'Account name too long').refine(
    (name) => !/<script|javascript:|data:/i.test(name),
    'Account name contains invalid content'
  ),
  platform_id: z.string().uuid(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const automationRuleSchema = z.object({
  rule_name: z.string().min(1).max(255),
  rule_description: z.string().max(1000).optional(),
  conditions: z.array(z.object({
    metric: z.enum(['cpa', 'roas', 'ctr', 'spend', 'conversions']),
    operator: z.enum(['>', '<', '>=', '<=', '=']),
    value: z.number().min(0),
    timeframe: z.enum(['last_day', 'last_3_days', 'last_7_days']),
  })).min(1),
  actions: z.array(z.object({
    type: z.enum(['pause', 'resume', 'budget_increase', 'budget_decrease', 'alert']),
    target: z.enum(['campaign', 'ad_set', 'ad']),
    value: z.number().min(0).optional(),
  })).min(1),
});

// Rate limiting helper
export const checkRateLimit = async (actionType: string, maxAttempts = 5, windowMinutes = 15): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      action_type_param: actionType,
      max_attempts: maxAttempts,
      window_minutes: windowMinutes,
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
};

// Security event logging
export const logSecurityEvent = async (
  eventType: string,
  eventDetails?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await supabase.rpc('log_security_event', {
      event_type: eventType,
      event_details: eventDetails || null,
      ip_addr: ipAddress || null,
      user_agent_str: userAgent || null,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

// Secure error handler that doesn't expose sensitive information
export const handleSecureError = (error: any, context: string): string => {
  // Log the full error for debugging
  console.error(`Error in ${context}:`, error);
  
  // Log security event
  logSecurityEvent('application_error', {
    context,
    error_message: error.message,
    timestamp: new Date().toISOString(),
  });

  // Return sanitized error message
  if (error.message?.includes('Invalid account ID format')) {
    return 'Please enter a valid account ID';
  }
  
  if (error.message?.includes('Account name contains invalid content')) {
    return 'Please enter a valid account name';
  }
  
  if (error.message?.includes('rate_limit_exceeded')) {
    return 'Too many attempts. Please try again later.';
  }

  // Generic error message for security
  return 'An error occurred. Please try again.';
};

// Validate account connection input with rate limiting
export const validateAccountConnection = async (data: any): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Check rate limit first
    const rateLimitOk = await checkRateLimit('account_connection', 3, 15);
    if (!rateLimitOk) {
      return { valid: false, error: 'Too many connection attempts. Please try again later.' };
    }

    // Validate input
    const result = accountConnectionSchema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors.map(e => e.message).join(', ');
      return { valid: false, error: errorMessage };
    }

    // Additional validation with database function
    if (data.account_id && data.account_name) {
      const { error } = await supabase.rpc('validate_account_input', {
        account_id_param: data.account_id,
        account_name_param: data.account_name,
      });

      if (error) {
        return { valid: false, error: handleSecureError(error, 'account_validation') };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: handleSecureError(error, 'account_connection_validation') };
  }
};

// Validate automation rule input with rate limiting
export const validateAutomationRule = async (data: any): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Check rate limit
    const rateLimitOk = await checkRateLimit('automation_rule_creation', 10, 60);
    if (!rateLimitOk) {
      return { valid: false, error: 'Too many rule creation attempts. Please try again later.' };
    }

    // Validate input
    const result = automationRuleSchema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors.map(e => e.message).join(', ');
      return { valid: false, error: errorMessage };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: handleSecureError(error, 'automation_rule_validation') };
  }
};