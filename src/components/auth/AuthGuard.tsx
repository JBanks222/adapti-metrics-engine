import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { Card, CardContent } from '@/components/ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse-glow">
            <div className="w-12 h-12 bg-primary rounded-xl"></div>
          </div>
          <p className="text-muted-foreground">Loading AdaptiGrowth...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">AG</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">AdaptiGrowth</h1>
            <p className="text-muted-foreground">
              Automated ad strategy engine for growth marketers
            </p>
          </div>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};