import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
}) => {
  const getChangeIcon = () => {
    if (!change) return null;
    if (change.value > 0) return <ArrowUp className="h-3 w-3" />;
    if (change.value < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (!change) return '';
    if (change.value > 0) return 'text-success';
    if (change.value < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={cn("flex items-center text-xs mt-1", getChangeColor())}>
            {getChangeIcon()}
            <span className="ml-1">
              {Math.abs(change.value)}% {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};