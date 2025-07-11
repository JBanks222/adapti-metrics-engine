import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE') || supabaseAnonKey.includes('YOUR_SUPABASE')) {
  console.error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  throw new Error('Missing Supabase environment variables. Please configure your Supabase URL and anon key.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getCampaignsWithMetrics = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      ad_accounts!inner(
        *,
        ad_platforms(*)
      ),
      ad_sets(
        *,
        ads(
          *,
          ad_metrics(*)
        )
      )
    `)
    .eq('ad_accounts.is_connected', true);
    
  if (error) throw error;
  return data;
};

export const getRecentActions = async (limit = 10) => {
  const { data, error } = await supabase
    .from('actions_log')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};