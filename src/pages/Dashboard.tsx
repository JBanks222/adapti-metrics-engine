import React from 'react';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { CampaignComparison } from '@/components/dashboard/CampaignComparison';
import { AutomatedActions } from '@/components/dashboard/AutomatedActions';
import { Eye, MousePointer, DollarSign, Target, TrendingUp } from 'lucide-react';

// Mock data for demo
const mockMetrics = [
  { title: 'Total Impressions', value: '2.4M', change: { value: 12, period: 'vs last week' }, icon: <Eye className="h-4 w-4" /> },
  { title: 'Total Clicks', value: '48.2K', change: { value: 8, period: 'vs last week' }, icon: <MousePointer className="h-4 w-4" /> },
  { title: 'Total Spend', value: '$12,430', change: { value: -5, period: 'vs last week' }, icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Avg CPA', value: '$25.80', change: { value: -12, period: 'vs last week' }, icon: <Target className="h-4 w-4" /> },
  { title: 'Avg ROAS', value: '3.2x', change: { value: 15, period: 'vs last week' }, icon: <TrendingUp className="h-4 w-4" /> },
];

const mockChartData = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
  ctr: 2.1 + Math.random() * 0.8,
  cpa: 20 + Math.random() * 10,
  roas: 2.8 + Math.random() * 1.2,
}));

const mockCampaignData = [
  { name: 'Campaign A', spend: 2500, conversions: 45, roas: 3.2 },
  { name: 'Campaign B', spend: 1800, conversions: 32, roas: 2.8 },
  { name: 'Campaign C', spend: 3200, conversions: 58, roas: 3.8 },
];

const mockActions = [
  {
    id: '1',
    type: 'pause' as const,
    target_name: 'Summer Sale Campaign',
    reason: 'CPA exceeded $30 threshold',
    executed_at: new Date().toISOString(),
    status: 'executed' as const,
    metrics: { cpa: 32.5, ctr: 1.2, roas: 2.1 }
  },
  {
    id: '2',
    type: 'budget_increase' as const,
    target_name: 'Black Friday Promo',
    reason: 'ROAS increased 20% - scaling budget',
    executed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'executed' as const,
    metrics: { roas: 4.2, ctr: 3.1 }
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {mockMetrics.map((metric, index) => (
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
          data={mockChartData}
        />
        <CampaignComparison data={mockCampaignData} />
      </div>

      {/* Automated Actions */}
      <AutomatedActions actions={mockActions} />
    </div>
  );
};