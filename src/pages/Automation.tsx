import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RuleBuilder } from '@/components/automation/RuleBuilder';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Settings, Play, Pause, Edit, Trash2 } from 'lucide-react';

export const Automation: React.FC = () => {
  const { rules, loading, toggleRule, deleteRule, refetch } = useAutomationRules();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Rules</h1>
          <p className="text-muted-foreground">
            Create and manage automated optimization rules for your campaigns
          </p>
        </div>
        
        <RuleBuilder onRuleCreated={refetch} />
      </div>

      {/* Rules Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => !r.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Inactive Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.last_triggered_at).length}</p>
                <p className="text-sm text-muted-foreground">Recently Triggered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No automation rules yet</p>
              <p className="text-sm">Create your first rule to start automating</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{rule.rule_name}</h3>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rule.rule_description || 'No description provided'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Conditions:</span> {rule.conditions.length} condition(s)
                      <span className="mx-2">•</span>
                      <span className="font-medium">Actions:</span> {rule.actions.length} action(s)
                      {rule.last_triggered_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Last triggered: {new Date(rule.last_triggered_at).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};