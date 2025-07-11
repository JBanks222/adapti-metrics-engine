import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  title: string;
  data: Array<{
    date: string;
    ctr: number;
    cpa: number;
    roas: number;
  }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ title, data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis className="text-xs" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  name === 'ctr' ? `${value}%` : 
                  name === 'cpa' ? `$${value}` : 
                  `${value}x`,
                  name.toUpperCase()
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ctr" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="cpa" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="roas" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};