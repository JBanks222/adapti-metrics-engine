-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to process automation rules via edge function
CREATE OR REPLACE FUNCTION public.trigger_automation_processing()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT net.http_post(
    url := 'https://cigqptkxjxorlenvvets.supabase.co/functions/v1/process-automation-rules',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZ3FwdGt4anhvcmxlbnZ2ZXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzQ5MjAsImV4cCI6MjA2Nzg1MDkyMH0.nokCN2_VrVTAKw2JgiwHk2JTjeAADx8SvHEsSeBIzPo'
    ),
    body := jsonb_build_object('timestamp', now()::text)
  );
$$;

-- Schedule automation rule processing every 15 minutes
SELECT cron.schedule(
  'process-automation-rules',
  '*/15 * * * *', -- Every 15 minutes
  'SELECT public.trigger_automation_processing();'
);

-- Create function to calculate advanced analytics
CREATE OR REPLACE FUNCTION public.calculate_campaign_performance(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  campaign_id TEXT,
  campaign_name TEXT,
  total_spend DECIMAL,
  total_conversions INTEGER,
  total_clicks INTEGER,
  total_impressions INTEGER,
  avg_cpa DECIMAL,
  avg_ctr DECIMAL,
  avg_roas DECIMAL,
  trend_direction TEXT,
  performance_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH campaign_metrics AS (
    SELECT 
      c.campaign_id,
      c.campaign_name,
      SUM(COALESCE(m.spend, 0)) as spend,
      SUM(COALESCE(m.conversions, 0)) as conversions,
      SUM(COALESCE(m.clicks, 0)) as clicks,
      SUM(COALESCE(m.impressions, 0)) as impressions,
      SUM(COALESCE(m.conversion_value, 0)) as conversion_value
    FROM campaigns c
    LEFT JOIN ad_metrics m ON c.id = m.campaign_id
    WHERE c.user_id = p_user_id
      AND m.date_start >= (CURRENT_DATE - INTERVAL '1 day' * p_days_back)
    GROUP BY c.campaign_id, c.campaign_name
  ),
  recent_metrics AS (
    SELECT 
      c.campaign_id,
      SUM(COALESCE(m.spend, 0)) as recent_spend,
      SUM(COALESCE(m.conversions, 0)) as recent_conversions
    FROM campaigns c
    LEFT JOIN ad_metrics m ON c.id = m.campaign_id
    WHERE c.user_id = p_user_id
      AND m.date_start >= (CURRENT_DATE - INTERVAL '7 days')
    GROUP BY c.campaign_id
  )
  SELECT 
    cm.campaign_id::TEXT,
    cm.campaign_name,
    cm.spend::DECIMAL,
    cm.conversions::INTEGER,
    cm.clicks::INTEGER,
    cm.impressions::INTEGER,
    CASE 
      WHEN cm.conversions > 0 THEN (cm.spend / cm.conversions)::DECIMAL
      ELSE 0::DECIMAL
    END as avg_cpa,
    CASE 
      WHEN cm.impressions > 0 THEN ((cm.clicks::DECIMAL / cm.impressions::DECIMAL) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END as avg_ctr,
    CASE 
      WHEN cm.spend > 0 THEN (cm.conversion_value / cm.spend)::DECIMAL
      ELSE 0::DECIMAL
    END as avg_roas,
    CASE 
      WHEN rm.recent_conversions > (cm.conversions / (p_days_back / 7.0)) THEN 'up'::TEXT
      WHEN rm.recent_conversions < (cm.conversions / (p_days_back / 7.0)) THEN 'down'::TEXT
      ELSE 'stable'::TEXT
    END as trend_direction,
    CASE 
      WHEN cm.conversions > 0 AND cm.spend > 0 THEN 
        LEAST(100, (cm.conversion_value / cm.spend) * 25)::DECIMAL
      ELSE 0::DECIMAL
    END as performance_score
  FROM campaign_metrics cm
  LEFT JOIN recent_metrics rm ON cm.campaign_id = rm.campaign_id
  WHERE cm.spend > 0 OR cm.conversions > 0
  ORDER BY performance_score DESC;
END;
$$;