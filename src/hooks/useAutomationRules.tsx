import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RuleCondition {
  metric: 'cpa' | 'roas' | 'ctr' | 'spend' | 'conversions';
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: number;
  timeframe: 'last_day' | 'last_3_days' | 'last_7_days';
}

export interface RuleAction {
  type: 'pause' | 'resume' | 'budget_increase' | 'budget_decrease' | 'alert';
  value?: number; // percentage for budget changes
  target: 'campaign' | 'ad_set' | 'ad';
}

export interface AutomationRule {
  id: string;
  rule_name: string;
  rule_description: string | null;
  conditions: RuleCondition[];
  actions: RuleAction[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedRules = (data || []).map(rule => ({
        id: rule.id,
        rule_name: rule.rule_name,
        rule_description: rule.rule_description,
        conditions: Array.isArray(rule.conditions) ? rule.conditions as unknown as RuleCondition[] : [rule.conditions as unknown as RuleCondition],
        actions: Array.isArray(rule.actions) ? rule.actions as unknown as RuleAction[] : [rule.actions as unknown as RuleAction],
        is_active: rule.is_active || false,
        last_triggered_at: rule.last_triggered_at,
        created_at: rule.created_at,
        updated_at: rule.updated_at,
      }));

      setRules(transformedRules);
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      toast({
        title: "Error Loading Rules",
        description: "Failed to load automation rules. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createRule = async (ruleData: {
    rule_name: string;
    rule_description?: string;
    conditions: RuleCondition[];
    actions: RuleAction[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          user_id: user.id,
          rule_name: ruleData.rule_name,
          rule_description: ruleData.rule_description,
          conditions: ruleData.conditions as any,
          actions: ruleData.actions as any,
        })
        .select()
        .single();

      if (error) throw error;

      const newRule: AutomationRule = {
        id: data.id,
        rule_name: data.rule_name,
        rule_description: data.rule_description,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        is_active: data.is_active || false,
        last_triggered_at: data.last_triggered_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setRules(prev => [newRule, ...prev]);
      
      toast({
        title: "Rule Created",
        description: `${ruleData.rule_name} has been created successfully.`,
      });

      return newRule;
    } catch (error) {
      console.error('Error creating automation rule:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create automation rule. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.conditions) {
        dbUpdates.conditions = updates.conditions as any;
      }
      if (updates.actions) {
        dbUpdates.actions = updates.actions as any;
      }

      const { data, error } = await supabase
        .from('automation_rules')
        .update(dbUpdates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      const updatedRule: AutomationRule = {
        id: data.id,
        rule_name: data.rule_name,
        rule_description: data.rule_description,
        conditions: (updates.conditions || Array.isArray(data.conditions) ? data.conditions as unknown as RuleCondition[] : [data.conditions as unknown as RuleCondition]),
        actions: (updates.actions || Array.isArray(data.actions) ? data.actions as unknown as RuleAction[] : [data.actions as unknown as RuleAction]),
        is_active: data.is_active || false,
        last_triggered_at: data.last_triggered_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? updatedRule : rule
      ));

      toast({
        title: "Rule Updated",
        description: "Automation rule has been updated successfully.",
      });

      return updatedRule;
    } catch (error) {
      console.error('Error updating automation rule:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update automation rule. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: "Rule Deleted",
        description: "Automation rule has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete automation rule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    await updateRule(ruleId, { is_active: isActive });
  };

  useEffect(() => {
    const loadRules = async () => {
      setLoading(true);
      await fetchRules();
      setLoading(false);
    };

    loadRules();
  }, []);

  return {
    rules,
    loading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules,
  };
};