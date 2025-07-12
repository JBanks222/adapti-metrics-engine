import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  Info,
  Shield,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdPlatforms } from '@/hooks/useAdPlatforms';

export const SetupGuide: React.FC = () => {
  const { toast } = useToast();
  const { platforms, accounts } = useAdPlatforms();
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const toggleTokenVisibility = (platform: string) => {
    setShowTokens(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: "Performance Optimization",
      description: "Automatically optimize campaigns based on real-time performance data"
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: "Smart Automation",
      description: "Set rules to pause underperforming ads and scale winning campaigns"
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "24/7 Monitoring",
      description: "Continuous monitoring with instant alerts and automated responses"
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "Budget Protection",
      description: "Prevent overspending with intelligent budget management rules"
    }
  ];

  const getConnectionStatus = (platformName: string) => {
    const platformData = platforms.find(p => p.name === platformName);
    if (!platformData) return false;
    
    return accounts.some(acc => 
      acc.platform_id === platformData.id && acc.is_active
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AdaptiGrowth Setup Guide
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect your advertising accounts to start optimizing your campaigns automatically
        </p>
      </div>

      {/* Benefits Overview */}
      <Card className="mb-8">
        <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Why Connect Your Ad Accounts?</span>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                {benefit.icon}
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads'].map((platform) => {
              const isConnected = getConnectionStatus(platform);
              return (
                <Badge 
                  key={platform}
                  variant={isConnected ? "default" : "secondary"}
                  className="flex items-center space-x-2 px-3 py-1"
                >
                  {isConnected && <CheckCircle className="h-4 w-4" />}
                  <span>{platform}</span>
                  {isConnected && <span className="text-xs">Connected</span>}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meta" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok Ads</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Ads</TabsTrigger>
        </TabsList>

        {/* Meta Ads Setup */}
        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Meta Ads (Facebook & Instagram) Setup</span>
                <Badge variant={getConnectionStatus('Meta Ads') ? "default" : "secondary"}>
                  {getConnectionStatus('Meta Ads') ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll need admin access to your Facebook Ad Account and Business Manager to complete this setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 1: Create a Meta App</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}>Facebook Developers <ExternalLink className="h-3 w-3 inline ml-1" /></Button></li>
                    <li>Click "Create App" and select "Business" as the app type</li>
                    <li>Enter your app name and contact email</li>
                    <li>Add the "Marketing API" product to your app</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 2: Get Your App Credentials</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>In your app dashboard, go to Settings → Basic</li>
                    <li>Copy your App ID and App Secret</li>
                    <li>Add this redirect URL to your app settings:</li>
                  </ol>
                  <div className="mt-2 p-2 bg-muted rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback', 'Redirect URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 3: Configure Permissions</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your app will need these permissions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'ads_management',
                      'ads_read',
                      'business_management',
                      'pages_read_engagement'
                    ].map((permission) => (
                      <Badge key={permission} variant="outline" className="justify-center">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 4: Connect Your Account</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Once your Meta app is configured, use the button below to connect your ad account.
                  </p>
                  <Button className="w-full">
                    Connect Meta Ads Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Ads Setup */}
        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Google Ads Setup</span>
                <Badge variant={getConnectionStatus('Google Ads') ? "default" : "secondary"}>
                  {getConnectionStatus('Google Ads') ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll need admin access to your Google Ads account and Google Cloud Console to complete this setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 1: Enable Google Ads API</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://console.cloud.google.com/', '_blank')}>Google Cloud Console <ExternalLink className="h-3 w-3 inline ml-1" /></Button></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable the Google Ads API for your project</li>
                    <li>Create credentials (OAuth 2.0 Client ID)</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 2: Configure OAuth</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>In Google Cloud Console, go to APIs & Services → Credentials</li>
                    <li>Click "Create Credentials" → "OAuth 2.0 Client IDs"</li>
                    <li>Set application type to "Web application"</li>
                    <li>Add this redirect URI:</li>
                  </ol>
                  <div className="mt-2 p-2 bg-muted rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback', 'Redirect URI')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 3: Get Developer Token</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Sign in to your Google Ads account</li>
                    <li>Go to Tools & Settings → API Center</li>
                    <li>Apply for a developer token (required for production access)</li>
                    <li>For testing, you can use a test account</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 4: Connect Your Account</h3>
                  <Button className="w-full">
                    Connect Google Ads Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TikTok Ads Setup */}
        <TabsContent value="tiktok">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>TikTok Ads Setup</span>
                <Badge variant={getConnectionStatus('TikTok Ads') ? "default" : "secondary"}>
                  {getConnectionStatus('TikTok Ads') ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll need admin access to your TikTok Business account and TikTok for Business to complete this setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 1: Create TikTok for Business App</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://business-api.tiktok.com/', '_blank')}>TikTok for Business <ExternalLink className="h-3 w-3 inline ml-1" /></Button></li>
                    <li>Sign in with your TikTok Business account</li>
                    <li>Apply for Marketing API access</li>
                    <li>Create a new app in the developer portal</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 2: Configure App Settings</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>In your app settings, configure the redirect URL</li>
                    <li>Add the required scopes for campaign management</li>
                    <li>Copy your App ID and App Secret</li>
                  </ol>
                  <div className="mt-2 p-2 bg-muted rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback', 'Redirect URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 3: Connect Your Account</h3>
                  <Button className="w-full">
                    Connect TikTok Ads Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LinkedIn Ads Setup */}
        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>LinkedIn Ads Setup</span>
                <Badge variant={getConnectionStatus('LinkedIn Ads') ? "default" : "secondary"}>
                  {getConnectionStatus('LinkedIn Ads') ? 'Connected' : 'Not Connected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You'll need admin access to your LinkedIn Campaign Manager and LinkedIn Developer account to complete this setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 1: Create LinkedIn App</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Go to <Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://developer.linkedin.com/', '_blank')}>LinkedIn Developer Portal <ExternalLink className="h-3 w-3 inline ml-1" /></Button></li>
                    <li>Sign in and create a new app</li>
                    <li>Associate it with your LinkedIn Company Page</li>
                    <li>Request access to Marketing Developer Platform</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 2: Configure OAuth Settings</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>In your app settings, go to the Auth tab</li>
                    <li>Add the redirect URL to your OAuth 2.0 settings</li>
                    <li>Request the required scopes for campaign management</li>
                  </ol>
                  <div className="mt-2 p-2 bg-muted rounded border">
                    <div className="flex items-center justify-between">
                      <code className="text-sm">https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('https://cigqptkxjxorlenvvets.supabase.co/auth/v1/callback', 'Redirect URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Step 3: Connect Your Account</h3>
                  <Button className="w-full">
                    Connect LinkedIn Ads Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Your data is secure:</strong> All API tokens are encrypted and stored securely. 
              We only access the minimum required permissions to provide optimization services.
            </p>
            <p>
              <strong>Read-only by default:</strong> Our system primarily reads your campaign data for analysis. 
              Any automated changes require your explicit authorization through automation rules.
            </p>
            <p>
              <strong>Audit trail:</strong> All automated actions are logged and can be reviewed in your account dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupGuide;