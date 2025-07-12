import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { useAdPlatforms } from '@/hooks/useAdPlatforms';
import { useNavigate } from 'react-router-dom';

export const AdAccountStatus: React.FC = () => {
  const { accounts, platforms } = useAdPlatforms();
  const navigate = useNavigate();

  return (
    <Card className="border-warning bg-warning/5">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <CardTitle className="text-warning">Ad Account Setup Required</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Connect your advertising accounts to start tracking performance and automating optimizations.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => {
            const isConnected = accounts.some(acc => 
              acc.platform_id === platform.id && acc.is_active
            );
            
            return (
              <Badge 
                key={platform.id}
                variant={isConnected ? "default" : "secondary"}
                className="flex items-center space-x-1"
              >
                <span>{platform.name}</span>
                {isConnected && <span className="text-xs">✓</span>}
              </Badge>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Connect Ad Account</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => navigate('/setup-guide')}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Setup Guide</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};