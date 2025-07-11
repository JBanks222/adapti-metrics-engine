export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          plan_type: 'free' | 'starter' | 'professional' | 'enterprise';
          stripe_customer_id: string | null;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          plan_type?: 'free' | 'starter' | 'professional' | 'enterprise';
          stripe_customer_id?: string | null;
          subscription_status?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          plan_type?: 'free' | 'starter' | 'professional' | 'enterprise';
          stripe_customer_id?: string | null;
          subscription_status?: string;
        };
      };
      ad_platforms: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          is_active: boolean;
          created_at: string;
        };
      };
      ad_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform_id: string;
          account_id: string;
          account_name: string;
          access_token: string | null;
          is_connected: boolean;
          last_sync: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          platform_id: string;
          account_id: string;
          account_name: string;
          access_token?: string | null;
          is_connected?: boolean;
          last_sync?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          ad_account_id: string;
          campaign_id: string;
          name: string;
          status: 'active' | 'paused' | 'archived' | 'draft';
          objective: string | null;
          daily_budget: number | null;
          lifetime_budget: number | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          ad_account_id: string;
          campaign_id: string;
          name: string;
          status?: 'active' | 'paused' | 'archived' | 'draft';
          objective?: string | null;
          daily_budget?: number | null;
          lifetime_budget?: number | null;
          start_date?: string | null;
          end_date?: string | null;
        };
      };
      ad_metrics: {
        Row: {
          id: string;
          ad_id: string;
          date: string;
          impressions: number;
          clicks: number;
          spend: number;
          conversions: number;
          conversion_value: number;
          ctr: number | null;
          cpc: number | null;
          cpa: number | null;
          roas: number | null;
          frequency: number | null;
          reach: number | null;
          created_at: string;
        };
      };
      automation_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          conditions: any;
          actions: any;
          frequency: 'hourly' | 'daily' | 'weekly';
          applies_to: 'campaigns' | 'ad_sets' | 'ads';
          last_executed: string | null;
          execution_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          conditions: any;
          actions: any;
          frequency?: 'hourly' | 'daily' | 'weekly';
          applies_to?: 'campaigns' | 'ad_sets' | 'ads';
        };
      };
      actions_log: {
        Row: {
          id: string;
          rule_id: string | null;
          user_id: string;
          target_type: 'campaign' | 'ad_set' | 'ad';
          target_id: string;
          target_name: string | null;
          action_type: string;
          action_details: any | null;
          trigger_metrics: any | null;
          status: 'pending' | 'executed' | 'failed' | 'reverted';
          error_message: string | null;
          executed_at: string;
          created_at: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'daily' | 'weekly' | 'monthly' | 'custom';
          date_range: any | null;
          filters: any | null;
          is_public: boolean;
          public_token: string | null;
          status: 'draft' | 'generated' | 'scheduled';
          generated_at: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}