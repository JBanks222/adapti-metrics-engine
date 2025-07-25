import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAccountConnection, logSecurityEvent } from '@/lib/security';

interface AdPlatform {
  id: string;
  name: string;
  api_endpoint: string | null;
  oauth_url: string | null;
  supports_oauth: boolean;
}

interface AdAccount {
  id: string;
  account_id: string;
  account_name: string;
  platform_id: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  platform: AdPlatform;
}

export const useAdPlatforms = () => {
  const [platforms, setPlatforms] = useState<AdPlatform[]>([]);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_platforms')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching ad platforms:', error);
      toast({
        title: "Error Loading Platforms",
        description: "Failed to load ad platforms. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ad_accounts')
        .select(`
          *,
          ad_platforms (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedAccounts = (data || []).map(account => ({
        ...account,
        platform: account.ad_platforms,
      }));
      
      setAccounts(transformedAccounts);
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      toast({
        title: "Error Loading Accounts",
        description: "Failed to load ad accounts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const connectAccount = async (platformId: string, accountData: {
    account_id: string;
    account_name: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
  }) => {
    try {
      // Validate input with security checks
      const validation = await validateAccountConnection({
        ...accountData,
        platform_id: platformId,
      });

      if (!validation.valid) {
        toast({
          title: "Validation failed",
          description: validation.error,
          variant: "destructive",
        });
        throw new Error(validation.error);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ad_accounts')
        .insert({
          user_id: user.id,
          platform_id: platformId,
          account_id: accountData.account_id,
          account_name: accountData.account_name,
          // Don't store tokens in plain text - they should be encrypted separately
          access_token: null,
          refresh_token: null,
          token_expires_at: accountData.token_expires_at,
          is_active: true,
        })
        .select(`
          *,
          ad_platforms (*)
        `)
        .single();

      if (error) throw error;

      // Log successful account connection
      await logSecurityEvent('account_connected', {
        platform_id: platformId,
        account_name: accountData.account_name,
      });

      // Transform the data to match our interface
      const transformedAccount = {
        ...data,
        platform: data.ad_platforms,
      };

      setAccounts(prev => [transformedAccount, ...prev]);
      toast({
        title: "Account Connected",
        description: `Successfully connected ${accountData.account_name}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error connecting account:', error);
      
      // Log failed connection attempt
      await logSecurityEvent('account_connection_failed', {
        platform_id: platformId,
        error_message: error.message,
      });

      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect ad account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('ad_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, is_active: false }
            : account
        )
      );

      toast({
        title: "Account Disconnected",
        description: "Ad account has been disconnected successfully.",
      });
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect ad account. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlatforms(), fetchAccounts()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    platforms,
    accounts,
    loading,
    connectAccount,
    disconnectAccount,
    refetch: () => {
      fetchPlatforms();
      fetchAccounts();
    },
  };
};