import React from 'react';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { CampaignComparison } from '@/components/dashboard/CampaignComparison';
import { AutomatedActions } from '@/components/dashboard/AutomatedActions';
import { AdAccountStatus } from '@/components/dashboard/AdAccountStatus';
import { Eye, MousePointer, DollarSign, Target, TrendingUp } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAdPlatforms } from '@/hooks/useAdPlatforms';
import { Skeleton } from '@/components/ui/skeleton';

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const Dashboard: React.FC = () => {
  const { metrics, performanceData, campaignData, actions, loading } = useDashboardData();
  const { accounts } = useAdPlatforms();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Loading Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>

        {/* Loading Actions */}
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Check if user has connected ad accounts
  const hasConnectedAccounts = accounts.length > 0 && accounts.some(acc => acc.is_active);

  const dashboardMetrics = metrics ? [
    { 
      title: 'Total Impressions', 
      value: formatNumber(metrics.totalImpressions), 
      change: { value: Math.round(metrics.impressionsChange), period: 'vs last week' }, 
      icon: <Eye className="h-4 w-4" /> 
    },
    { 
      title: 'Total Clicks', 
      value: formatNumber(metrics.totalClicks), 
      change: { value: Math.round(metrics.clicksChange), period: 'vs last week' }, 
      icon: <MousePointer className="h-4 w-4" /> 
    },
    { 
      title: 'Total Spend', 
      value: formatCurrency(metrics.totalSpend), 
      change: { value: Math.round(metrics.spendChange), period: 'vs last week' }, 
      icon: <DollarSign className="h-4 w-4" /> 
    },
    { 
      title: 'Avg CPA', 
      value: formatCurrency(metrics.avgCPA), 
      change: { value: Math.round(metrics.cpaChange), period: 'vs last week' }, 
      icon: <Target className="h-4 w-4" /> 
    },
    { 
      title: 'Avg ROAS', 
      value: `${metrics.avgROAS.toFixed(1)}x`, 
      change: { value: Math.round(metrics.roasChange), period: 'vs last week' }, 
      icon: <TrendingUp className="h-4 w-4" /> 
    },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ad Account Status */}
      {!hasConnectedAccounts && <AdAccountStatus />}

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {dashboardMetrics.map((metric, index) => (
          <MetricsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            className="animate-scale-in"
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart
          title="Performance Trends (Last 7 Days)"
          data={performanceData}
        />
        <CampaignComparison data={campaignData} />
      </div>

      {/* Automated Actions */}
      <AutomatedActions actions={actions} />
    </div>
  );
};