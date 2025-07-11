-- AdaptiGrowth Database Schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad platforms (Meta, Google, etc.)
CREATE TABLE public.ad_platforms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'meta', 'google', 'tiktok'
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad accounts connected to user
CREATE TABLE public.ad_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.ad_platforms(id),
  account_id TEXT NOT NULL, -- External platform account ID
  account_name TEXT NOT NULL,
  access_token TEXT, -- Encrypted token for API access
  is_connected BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_id, account_id)
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_account_id UUID REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL, -- External platform campaign ID
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'archived', 'draft')),
  objective TEXT, -- 'conversions', 'traffic', 'awareness', etc.
  daily_budget DECIMAL(10,2),
  lifetime_budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_account_id, campaign_id)
);

-- Ad sets within campaigns
CREATE TABLE public.ad_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ad_set_id TEXT NOT NULL, -- External platform ad set ID
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'archived')),
  targeting JSONB, -- Store targeting criteria as JSON
  daily_budget DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, ad_set_id)
);

-- Individual ads
CREATE TABLE public.ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_set_id UUID REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL, -- External platform ad ID
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'archived')),
  creative_type TEXT, -- 'image', 'video', 'carousel', etc.
  headline TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_set_id, ad_id)
);

-- Daily ad metrics (performance data)
CREATE TABLE public.ad_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(5,4), -- Click-through rate
  cpc DECIMAL(10,2), -- Cost per click
  cpa DECIMAL(10,2), -- Cost per acquisition
  roas DECIMAL(10,4), -- Return on ad spend
  frequency DECIMAL(5,2),
  reach INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, date)
);

-- Automation rules
CREATE TABLE public.automation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Conditions (stored as JSONB for flexibility)
  conditions JSONB NOT NULL, -- e.g., [{"metric": "cpa", "operator": ">", "value": 10}]
  
  -- Actions (stored as JSONB)
  actions JSONB NOT NULL, -- e.g., [{"type": "pause_ad"}, {"type": "adjust_budget", "change": -20}]
  
  -- Rule settings
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly')),
  applies_to TEXT DEFAULT 'campaigns' CHECK (applies_to IN ('campaigns', 'ad_sets', 'ads')),
  
  -- Metadata
  last_executed TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions log (history of automated actions taken)
CREATE TABLE public.actions_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- What was affected
  target_type TEXT CHECK (target_type IN ('campaign', 'ad_set', 'ad')),
  target_id UUID, -- References campaigns, ad_sets, or ads
  target_name TEXT,
  
  -- Action details
  action_type TEXT NOT NULL, -- 'pause', 'resume', 'budget_increase', 'budget_decrease'
  action_details JSONB, -- Additional action data
  
  -- Metrics that triggered the action
  trigger_metrics JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'reverted')),
  error_message TEXT,
  
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (saved/scheduled reports)
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  
  -- Report configuration
  date_range JSONB, -- {"start": "2024-01-01", "end": "2024-01-31"}
  filters JSONB, -- Campaign filters, platform filters, etc.
  
  -- Content and sharing
  is_public BOOLEAN DEFAULT false,
  public_token TEXT UNIQUE, -- For shareable links
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'scheduled')),
  generated_at TIMESTAMPTZ,
  file_url TEXT, -- URL to generated PDF
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default ad platforms
INSERT INTO public.ad_platforms (name, display_name) VALUES
('meta', 'Meta Ads (Facebook & Instagram)'),
('google', 'Google Ads'),
('tiktok', 'TikTok Ads'),
('linkedin', 'LinkedIn Ads');

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ad accounts
CREATE POLICY "Users can view own ad accounts" ON public.ad_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ad accounts" ON public.ad_accounts
FOR ALL USING (auth.uid() = user_id);

-- Campaigns
CREATE POLICY "Users can view own campaigns" ON public.campaigns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts 
    WHERE ad_accounts.id = campaigns.ad_account_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own campaigns" ON public.campaigns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts 
    WHERE ad_accounts.id = campaigns.ad_account_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

-- Similar policies for ad_sets, ads, ad_metrics
CREATE POLICY "Users can view own ad sets" ON public.ad_sets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE campaigns.id = ad_sets.campaign_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own ad sets" ON public.ad_sets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE campaigns.id = ad_sets.campaign_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own ads" ON public.ads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ad_sets 
    JOIN public.campaigns ON ad_sets.campaign_id = campaigns.id
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE ad_sets.id = ads.ad_set_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own ads" ON public.ads
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ad_sets 
    JOIN public.campaigns ON ad_sets.campaign_id = campaigns.id
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE ad_sets.id = ads.ad_set_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own ad metrics" ON public.ad_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ads 
    JOIN public.ad_sets ON ads.ad_set_id = ad_sets.id
    JOIN public.campaigns ON ad_sets.campaign_id = campaigns.id
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE ads.id = ad_metrics.ad_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own ad metrics" ON public.ad_metrics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ads 
    JOIN public.ad_sets ON ads.ad_set_id = ad_sets.id
    JOIN public.campaigns ON ad_sets.campaign_id = campaigns.id
    JOIN public.ad_accounts ON campaigns.ad_account_id = ad_accounts.id
    WHERE ads.id = ad_metrics.ad_id 
    AND ad_accounts.user_id = auth.uid()
  )
);

-- Automation rules
CREATE POLICY "Users can view own automation rules" ON public.automation_rules
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own automation rules" ON public.automation_rules
FOR ALL USING (auth.uid() = user_id);

-- Actions log
CREATE POLICY "Users can view own actions log" ON public.actions_log
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own actions log" ON public.actions_log
FOR ALL USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can view own reports" ON public.reports
FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own reports" ON public.reports
FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_sets_updated_at BEFORE UPDATE ON public.ad_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();