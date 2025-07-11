import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const PhaseStatus: React.FC = () => {
  const phases = [
    {
      number: 1,
      name: 'Database Foundation',
      status: 'completed',
      description: 'Core schema, RLS policies, authentication',
      completedFeatures: [
        'Database schema with 9 tables',
        'Row Level Security policies',
        'User profiles with auto-creation',
        'Ad platforms seeded',
      ],
    },
    {
      number: 2,
      name: 'Core Dashboard & Data Integration',
      status: 'completed',
      description: 'Real data integration, enhanced UI components',
      completedFeatures: [
        'Real-time dashboard metrics',
        'Supabase data integration hooks',
        'Ad account management interface',
        'Performance charts with live data',
        'Automated actions tracking',
        'Reports and automation pages',
      ],
    },
    {
      number: 3,
      name: 'Advanced Analytics & Automation',
      status: 'pending',
      description: 'Rule engine, advanced reporting, API integrations',
      plannedFeatures: [
        'Automation rule builder',
        'Advanced analytics engine',
        'Platform API integrations',
        'Real-time notifications',
      ],
    },
  ];

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🚀 AdaptiGrowth Development Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div key={phase.number} className="flex items-start space-x-4">
              <div className="flex items-center space-x-2">
                {phase.status === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-success" />
                ) : (
                  <Clock className="h-6 w-6 text-muted-foreground" />
                )}
                <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                  Phase {phase.number}
                </Badge>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{phase.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                
                <div className="grid gap-1">
                  {phase.status === 'completed' && phase.completedFeatures?.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  
                  {phase.status === 'pending' && phase.plannedFeatures?.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {index < phases.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};