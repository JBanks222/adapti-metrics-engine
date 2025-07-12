import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RuleCondition {
  metric: 'cpa' | 'roas' | 'ctr' | 'spend' | 'conversions';
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: number;
  timeframe: 'last_day' | 'last_3_days' | 'last_7_days';
}

interface RuleAction {
  type: 'pause' | 'resume' | 'budget_increase' | 'budget_decrease' | 'alert';
  value?: number;
  target: 'campaign' | 'ad_set' | 'ad';
}

interface AutomationRule {
  id: string;
  user_id: string;
  rule_name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  is_active: boolean;
}

// Initialize Supabase client inside the function for better security

const evaluateCondition = async (condition: RuleCondition, userId: string, supabase: any): Promise<boolean> => {
  const timeframeDays = {
    last_day: 1,
    last_3_days: 3,
    last_7_days: 7,
  };

  const daysAgo = timeframeDays[condition.timeframe];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Get metrics for the timeframe
  const { data: metrics, error } = await supabase
    .from('ad_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date_start', startDate.toISOString().split('T')[0]);

  if (error || !metrics || metrics.length === 0) {
    console.log(`No metrics found for user ${userId} in timeframe ${condition.timeframe}`);
    return false;
  }

  // Calculate aggregated metric value
  let metricValue = 0;
  const totalSpend = metrics.reduce((sum, m) => sum + (Number(m.spend) || 0), 0);
  const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalConversionValue = metrics.reduce((sum, m) => sum + (Number(m.conversion_value) || 0), 0);

  switch (condition.metric) {
    case 'cpa':
      metricValue = totalConversions > 0 ? totalSpend / totalConversions : 0;
      break;
    case 'roas':
      metricValue = totalSpend > 0 ? totalConversionValue / totalSpend : 0;
      break;
    case 'ctr':
      metricValue = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      break;
    case 'spend':
      metricValue = totalSpend;
      break;
    case 'conversions':
      metricValue = totalConversions;
      break;
  }

  // Evaluate condition
  switch (condition.operator) {
    case '>':
      return metricValue > condition.value;
    case '<':
      return metricValue < condition.value;
    case '>=':
      return metricValue >= condition.value;
    case '<=':
      return metricValue <= condition.value;
    case '=':
      return Math.abs(metricValue - condition.value) < 0.01; // Small tolerance for floating point
    default:
      return false;
  }
};

const executeAction = async (action: RuleAction, rule: AutomationRule, supabase: any): Promise<void> => {
  console.log(`Executing action ${action.type} for rule ${rule.rule_name}`);

  // Log the action
  await supabase
    .from('actions_log')
    .insert({
      user_id: rule.user_id,
      rule_id: rule.id,
      action_type: action.type,
      target_id: `rule-triggered-${rule.id}`,
      target_type: action.target,
      action_details: {
        rule_name: rule.rule_name,
        action_value: action.value,
        reason: `Automated action triggered by rule: ${rule.rule_name}`,
      },
      status: 'success',
    });

  // Update rule's last triggered time
  await supabase
    .from('automation_rules')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', rule.id);

  // In a real implementation, this would integrate with ad platform APIs
  // For now, we just log the action
  console.log(`Action executed: ${action.type} on ${action.target} for rule ${rule.rule_name}`);
};

const processRule = async (rule: AutomationRule, supabase: any): Promise<void> => {
  console.log(`Processing rule: ${rule.rule_name}`);

  if (!rule.is_active) {
    console.log(`Rule ${rule.rule_name} is inactive, skipping`);
    return;
  }

  // Check if all conditions are met
  const conditionResults = await Promise.all(
    rule.conditions.map(condition => evaluateCondition(condition, rule.user_id, supabase))
  );

  const allConditionsMet = conditionResults.every(result => result);

  if (allConditionsMet) {
    console.log(`All conditions met for rule ${rule.rule_name}, executing actions`);
    
    // Execute all actions
    await Promise.all(
      rule.actions.map(action => executeAction(action, rule, supabase))
    );
  } else {
    console.log(`Conditions not met for rule ${rule.rule_name}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Starting automation rule processing...');

    // Get all active automation rules
    const { data: rules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    if (!rules || rules.length === 0) {
      console.log('No active rules found');
      return new Response(
        JSON.stringify({ message: 'No active rules found', processed: 0 }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Found ${rules.length} active rules to process`);

    // Process each rule
    const processedRules = await Promise.allSettled(
      rules.map(rule => processRule({
        id: rule.id,
        user_id: rule.user_id,
        rule_name: rule.rule_name,
        conditions: Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions],
        actions: Array.isArray(rule.actions) ? rule.actions : [rule.actions],
        is_active: rule.is_active,
      }, supabase))
    );

    const successful = processedRules.filter(result => result.status === 'fulfilled').length;
    const failed = processedRules.filter(result => result.status === 'rejected').length;

    console.log(`Processing complete: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: 'Automation rule processing complete',
        total: rules.length,
        successful,
        failed,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error processing automation rules:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});