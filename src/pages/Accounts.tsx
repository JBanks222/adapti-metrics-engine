import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdPlatforms } from '@/hooks/useAdPlatforms';
import { Plus, Settings, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const Accounts: React.FC = () => {
  const { platforms, accounts, loading, connectAccount, disconnectAccount } = useAdPlatforms();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [accountData, setAccountData] = useState({
    account_id: '',
    account_name: '',
    access_token: '',
  });
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!selectedPlatform || !accountData.account_id || !accountData.account_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      await connectAccount(selectedPlatform, accountData);
      setConnectDialogOpen(false);
      setAccountData({ account_id: '', account_name: '', access_token: '' });
      setSelectedPlatform('');
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ad Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected advertising accounts and platforms
          </p>
        </div>
        
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Connect Account</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Ad Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {platforms.map(platform => (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className="justify-start"
                    >
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="account_id">Account ID</Label>
                <Input
                  id="account_id"
                  value={accountData.account_id}
                  onChange={(e) => setAccountData(prev => ({ ...prev, account_id: e.target.value }))}
                  placeholder="Enter your account ID"
                />
              </div>
              
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={accountData.account_name}
                  onChange={(e) => setAccountData(prev => ({ ...prev, account_name: e.target.value }))}
                  placeholder="Enter a name for this account"
                />
              </div>
              
              <div>
                <Label htmlFor="access_token">Access Token (Optional)</Label>
                <Input
                  id="access_token"
                  type="password"
                  value={accountData.access_token}
                  onChange={(e) => setAccountData(prev => ({ ...prev, access_token: e.target.value }))}
                  placeholder="Enter access token if available"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect} disabled={connecting}>
                  {connecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Account'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Available Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {platforms.map(platform => {
              const connectedAccounts = accounts.filter(acc => 
                acc.platform_id === platform.id && acc.is_active
              );
              
              return (
                <div key={platform.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{platform.name}</h3>
                    <Badge variant={connectedAccounts.length > 0 ? "default" : "secondary"}>
                      {connectedAccounts.length} connected
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {platform.supports_oauth ? 'OAuth supported' : 'Manual setup required'}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setConnectDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No accounts connected yet</p>
              <p className="text-sm">Connect your first ad account to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{account.account_name}</h3>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.platform.name} • ID: {account.account_id}
                    </p>
                    {account.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {new Date(account.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => disconnectAccount(account.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};