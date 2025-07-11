import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignComparisonProps {
  data: Array<{
    name: string;
    spend: number;
    conversions: number;
    roas: number;
  }>;
}

export const CampaignComparison: React.FC<CampaignComparisonProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'spend' ? `$${value}` : 
                  name === 'roas' ? `${value}x` : 
                  value,
                  name === 'spend' ? 'Spend' :
                  name === 'roas' ? 'ROAS' :
                  'Conversions'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="spend" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="conversions" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="roas" 
                fill="hsl(var(--chart-3))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};