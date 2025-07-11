import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Save, AlertTriangle } from 'lucide-react';
import { RuleCondition, RuleAction, useAutomationRules } from '@/hooks/useAutomationRules';

interface RuleBuilderProps {
  onRuleCreated?: () => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ onRuleCreated }) => {
  const { createRule } = useAutomationRules();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { metric: 'cpa', operator: '>', value: 0, timeframe: 'last_day' }
  ]);
  const [actions, setActions] = useState<RuleAction[]>([
    { type: 'pause', target: 'campaign' }
  ]);

  const addCondition = () => {
    setConditions([...conditions, { metric: 'cpa', operator: '>', value: 0, timeframe: 'last_day' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof RuleCondition, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { type: 'alert', target: 'campaign' }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof RuleAction, value: any) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    setActions(updated);
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      return;
    }

    setSaving(true);
    try {
      await createRule({
        rule_name: ruleName,
        rule_description: ruleDescription || undefined,
        conditions,
        actions,
      });

      // Reset form
      setRuleName('');
      setRuleDescription('');
      setConditions([{ metric: 'cpa', operator: '>', value: 0, timeframe: 'last_day' }]);
      setActions([{ type: 'pause', target: 'campaign' }]);
      setIsOpen(false);
      
      onRuleCreated?.();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const metricLabels = {
    cpa: 'Cost Per Acquisition',
    roas: 'Return on Ad Spend',
    ctr: 'Click-Through Rate (%)',
    spend: 'Daily Spend',
    conversions: 'Conversions',
  };

  const operatorLabels = {
    '>': 'greater than',
    '<': 'less than',
    '>=': 'greater than or equal',
    '<=': 'less than or equal',
    '=': 'equals',
  };

  const timeframeLabels = {
    last_day: 'Last 24 hours',
    last_3_days: 'Last 3 days',
    last_7_days: 'Last 7 days',
  };

  const actionLabels = {
    pause: 'Pause',
    resume: 'Resume',
    budget_increase: 'Increase Budget',
    budget_decrease: 'Decrease Budget',
    alert: 'Send Alert',
  };

  const targetLabels = {
    campaign: 'Campaign',
    ad_set: 'Ad Set',
    ad: 'Ad',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Rule</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Automation Rule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g., High CPA Pause Rule"
              />
            </div>
            
            <div>
              <Label htmlFor="rule-description">Description (Optional)</Label>
              <Textarea
                id="rule-description"
                value={ruleDescription}
                onChange={(e) => setRuleDescription(e.target.value)}
                placeholder="Describe what this rule does..."
                rows={2}
              />
            </div>
          </div>

          {/* Conditions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Conditions</CardTitle>
              <Button size="sm" variant="outline" onClick={addCondition}>
                <Plus className="h-3 w-3 mr-1" />
                Add Condition
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Badge variant="outline">IF</Badge>
                  
                  <Select
                    value={condition.metric}
                    onValueChange={(value) => updateCondition(index, 'metric', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(metricLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(operatorLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value) || 0)}
                    className="w-24"
                    step="0.01"
                  />

                  <Select
                    value={condition.timeframe}
                    onValueChange={(value) => updateCondition(index, 'timeframe', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(timeframeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {conditions.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              
              {conditions.length > 1 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>All conditions must be met for the rule to trigger</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Actions</CardTitle>
              <Button size="sm" variant="outline" onClick={addAction}>
                <Plus className="h-3 w-3 mr-1" />
                Add Action
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Badge variant="secondary">THEN</Badge>
                  
                  <Select
                    value={action.type}
                    onValueChange={(value) => updateAction(index, 'type', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(actionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(action.type === 'budget_increase' || action.type === 'budget_decrease') && (
                    <>
                      <span className="text-sm">by</span>
                      <Input
                        type="number"
                        value={action.value || 0}
                        onChange={(e) => updateAction(index, 'value', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min="1"
                        max="100"
                      />
                      <span className="text-sm">%</span>
                    </>
                  )}

                  <Select
                    value={action.target}
                    onValueChange={(value) => updateAction(index, 'target', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(targetLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {actions.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAction(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !ruleName.trim()}>
              {saving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Rule
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};