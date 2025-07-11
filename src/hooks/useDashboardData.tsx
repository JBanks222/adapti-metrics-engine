import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  avgCPA: number;
  avgROAS: number;
  impressionsChange: number;
  clicksChange: number;
  spendChange: number;
  cpaChange: number;
  roasChange: number;
}

interface PerformanceData {
  date: string;
  ctr: number;
  cpa: number;
  roas: number;
}

interface CampaignData {
  name: string;
  spend: number;
  conversions: number;
  roas: number;
}

interface AutomatedAction {
  id: string;
  type: 'pause' | 'resume' | 'budget_increase' | 'budget_decrease';
  target_name: string;
  reason: string;
  executed_at: string;
  status: 'pending' | 'success' | 'failed';
  metrics?: {
    cpa?: number;
    ctr?: number;
    roas?: number;
  };
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [actions, setActions] = useState<AutomatedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get last 30 days of metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: metricsData, error } = await supabase
        .from('ad_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_start', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;

      if (metricsData && metricsData.length > 0) {
        // Calculate current period (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const currentPeriod = metricsData.filter(m => 
          new Date(m.date_start) >= sevenDaysAgo
        );
        
        const previousPeriod = metricsData.filter(m => {
          const date = new Date(m.date_start);
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          return date >= fourteenDaysAgo && date < sevenDaysAgo;
        });

        const calculateMetrics = (data: typeof metricsData) => ({
          impressions: data.reduce((sum, m) => sum + (m.impressions || 0), 0),
          clicks: data.reduce((sum, m) => sum + (m.clicks || 0), 0),
          spend: data.reduce((sum, m) => sum + (Number(m.spend) || 0), 0),
          conversions: data.reduce((sum, m) => sum + (m.conversions || 0), 0),
          conversionValue: data.reduce((sum, m) => sum + (Number(m.conversion_value) || 0), 0),
        });

        const current = calculateMetrics(currentPeriod);
        const previous = calculateMetrics(previousPeriod);

        const avgCPA = current.conversions > 0 ? current.spend / current.conversions : 0;
        const avgROAS = current.spend > 0 ? current.conversionValue / current.spend : 0;
        const prevCPA = previous.conversions > 0 ? previous.spend / previous.conversions : 0;
        const prevROAS = previous.spend > 0 ? previous.conversionValue / previous.spend : 0;

        setMetrics({
          totalImpressions: current.impressions,
          totalClicks: current.clicks,
          totalSpend: current.spend,
          avgCPA,
          avgROAS,
          impressionsChange: previous.impressions > 0 ? 
            ((current.impressions - previous.impressions) / previous.impressions) * 100 : 0,
          clicksChange: previous.clicks > 0 ? 
            ((current.clicks - previous.clicks) / previous.clicks) * 100 : 0,
          spendChange: previous.spend > 0 ? 
            ((current.spend - previous.spend) / previous.spend) * 100 : 0,
          cpaChange: prevCPA > 0 ? ((avgCPA - prevCPA) / prevCPA) * 100 : 0,
          roasChange: prevROAS > 0 ? ((avgROAS - prevROAS) / prevROAS) * 100 : 0,
        });
      } else {
        // No data available - show zero metrics
        setMetrics({
          totalImpressions: 0,
          totalClicks: 0,
          totalSpend: 0,
          avgCPA: 0,
          avgROAS: 0,
          impressionsChange: 0,
          clicksChange: 0,
          spendChange: 0,
          cpaChange: 0,
          roasChange: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error Loading Metrics",
        description: "Failed to load dashboard metrics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('ad_metrics')
        .select('date_start, ctr, cpc, roas, impressions, clicks, spend, conversions, conversion_value')
        .eq('user_id', user.id)
        .gte('date_start', sevenDaysAgo.toISOString().split('T')[0])
        .order('date_start', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Group by date and calculate daily averages
        const dailyData = data.reduce((acc: Record<string, any>, metric) => {
          const date = metric.date_start;
          if (!acc[date]) {
            acc[date] = {
              date,
              impressions: 0,
              clicks: 0,
              spend: 0,
              conversions: 0,
              conversionValue: 0,
              count: 0,
            };
          }
          
          acc[date].impressions += metric.impressions || 0;
          acc[date].clicks += metric.clicks || 0;
          acc[date].spend += Number(metric.spend) || 0;
          acc[date].conversions += metric.conversions || 0;
          acc[date].conversionValue += Number(metric.conversion_value) || 0;
          acc[date].count += 1;
          
          return acc;
        }, {});

        const performanceArray = Object.values(dailyData).map((day: any) => ({
          date: day.date,
          ctr: day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0,
          cpa: day.conversions > 0 ? day.spend / day.conversions : 0,
          roas: day.spend > 0 ? day.conversionValue / day.spend : 0,
        }));

        setPerformanceData(performanceArray);
      } else {
        // Generate empty data for last 7 days if no metrics available
        const emptyData = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ctr: 0,
          cpa: 0,
          roas: 0,
        }));
        setPerformanceData(emptyData);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const fetchCampaignData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          campaign_name,
          ad_metrics (
            spend,
            conversions,
            conversion_value
          )
        `)
        .eq('user_id', user.id)
        .limit(5);

      if (campaignsError) throw campaignsError;

      if (campaigns && campaigns.length > 0) {
        const campaignPerformance = campaigns.map(campaign => {
          const metrics = campaign.ad_metrics || [];
          const totalSpend = metrics.reduce((sum: number, m: any) => sum + (Number(m.spend) || 0), 0);
          const totalConversions = metrics.reduce((sum: number, m: any) => sum + (m.conversions || 0), 0);
          const totalConversionValue = metrics.reduce((sum: number, m: any) => sum + (Number(m.conversion_value) || 0), 0);
          
          return {
            name: campaign.campaign_name,
            spend: totalSpend,
            conversions: totalConversions,
            roas: totalSpend > 0 ? totalConversionValue / totalSpend : 0,
          };
        }).filter(c => c.spend > 0); // Only show campaigns with spend

        setCampaignData(campaignPerformance);
      } else {
        setCampaignData([]);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    }
  };

  const fetchAutomatedActions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('actions_log')
        .select('*')
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedActions = data.map(action => ({
          id: action.id,
          type: action.action_type as AutomatedAction['type'],
          target_name: action.target_id, // This would ideally join with campaign/ad names
          reason: (action.action_details as any)?.reason || 'Automated action executed',
          executed_at: action.executed_at || new Date().toISOString(),
          status: action.status === 'success' ? 'success' as const : 
                 action.status === 'failed' ? 'failed' as const : 'pending' as const,
          metrics: action.action_details as any,
        }));

        setActions(formattedActions);
      } else {
        setActions([]);
      }
    } catch (error) {
      console.error('Error fetching automated actions:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardMetrics(),
        fetchPerformanceData(),
        fetchCampaignData(),
        fetchAutomatedActions(),
      ]);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  return {
    metrics,
    performanceData,
    campaignData,
    actions,
    loading,
    refetch: () => {
      fetchDashboardMetrics();
      fetchPerformanceData();
      fetchCampaignData();
      fetchAutomatedActions();
    },
  };
};