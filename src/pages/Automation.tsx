import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Play, Pause, Edit } from 'lucide-react';

const mockRules = [
  {
    id: '1',
    name: 'High CPA Pause Rule',
    description: 'Pause campaigns when CPA exceeds $30',
    isActive: true,
    lastTriggered: '2024-01-15 14:30:00',
    conditions: { metric: 'CPA', operator: '>', value: 30 },
    actions: { type: 'pause' },
  },
  {
    id: '2',
    name: 'Scale High ROAS',
    description: 'Increase budget by 20% when ROAS > 4.0',
    isActive: true,
    lastTriggered: '2024-01-14 09:15:00',
    conditions: { metric: 'ROAS', operator: '>', value: 4.0 },
    actions: { type: 'budget_increase', value: 20 },
  },
  {
    id: '3',
    name: 'Low CTR Alert',
    description: 'Send alert when CTR drops below 1.5%',
    isActive: false,
    lastTriggered: null,
    conditions: { metric: 'CTR', operator: '<', value: 1.5 },
    actions: { type: 'alert' },
  },
];

export const Automation: React.FC = () => {
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Rules</h1>
          <p className="text-muted-foreground">
            Create and manage automated optimization rules for your campaigns
          </p>
        </div>
        
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Rule</span>
        </Button>
      </div>

      {/* Rules Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</p>
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
                <p className="text-2xl font-bold">{rules.filter(r => !r.isActive).length}</p>
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
                <p className="text-2xl font-bold">{rules.filter(r => r.lastTriggered).length}</p>
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
                      <h3 className="font-medium">{rule.name}</h3>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rule.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Condition:</span> {rule.conditions.metric} {rule.conditions.operator} {rule.conditions.value}
                      {rule.lastTriggered && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Last triggered: {new Date(rule.lastTriggered).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
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