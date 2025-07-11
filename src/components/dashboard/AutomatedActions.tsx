import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pause, Play, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomatedAction {
  id: string;
  type: 'pause' | 'resume' | 'budget_increase' | 'budget_decrease';
  target_name: string;
  reason: string;
  executed_at: string;
  status: 'pending' | 'executed' | 'failed';
  metrics?: {
    cpa?: number;
    ctr?: number;
    roas?: number;
  };
}

interface AutomatedActionsProps {
  actions: AutomatedAction[];
  onViewAll?: () => void;
}

const actionIcons = {
  pause: Pause,
  resume: Play,
  budget_increase: TrendingUp,
  budget_decrease: TrendingDown,
};

const statusColors = {
  pending: 'text-warning',
  executed: 'text-success',
  failed: 'text-danger',
};

const statusIcons = {
  pending: Clock,
  executed: CheckCircle,
  failed: AlertTriangle,
};

export const AutomatedActions: React.FC<AutomatedActionsProps> = ({ 
  actions, 
  onViewAll 
}) => {
  const recentActions = actions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Automated Actions</CardTitle>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pause className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No automated actions yet</p>
              <p className="text-sm">Actions will appear here when rules are triggered</p>
            </div>
          ) : (
            recentActions.map((action) => {
              const ActionIcon = actionIcons[action.type];
              const StatusIcon = statusIcons[action.status];
              
              return (
                <div key={action.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    action.type === 'pause' ? 'bg-danger/10 text-danger' :
                    action.type === 'resume' ? 'bg-success/10 text-success' :
                    action.type === 'budget_increase' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  )}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {action.target_name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={cn("h-3 w-3", statusColors[action.status])} />
                        <Badge 
                          variant={action.status === 'executed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {action.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.reason}
                    </p>
                    
                    {action.metrics && (
                      <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                        {action.metrics.cpa && (
                          <span>CPA: ${action.metrics.cpa}</span>
                        )}
                        {action.metrics.ctr && (
                          <span>CTR: {action.metrics.ctr}%</span>
                        )}
                        {action.metrics.roas && (
                          <span>ROAS: {action.metrics.roas}x</span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(action.executed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};