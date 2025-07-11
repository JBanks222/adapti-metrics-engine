import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, Plus, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const mockReports = [
  {
    id: '1',
    name: 'Weekly Performance Summary',
    type: 'Performance',
    lastGenerated: '2024-01-15 09:00:00',
    isScheduled: true,
    schedule: 'Weekly - Mondays at 9 AM',
  },
  {
    id: '2',
    name: 'Campaign ROI Analysis',
    type: 'ROI',
    lastGenerated: '2024-01-14 16:30:00',
    isScheduled: false,
    schedule: null,
  },
  {
    id: '3',
    name: 'Monthly Budget Overview',
    type: 'Budget',
    lastGenerated: '2024-01-01 08:00:00',
    isScheduled: true,
    schedule: 'Monthly - 1st at 8 AM',
  },
];

export const Reports: React.FC = () => {
  const [reports] = useState(mockReports);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and schedule performance reports for your campaigns
          </p>
        </div>
        
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Report</span>
        </Button>
      </div>

      {/* Quick Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Quick Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Summary</SelectItem>
                  <SelectItem value="roi">ROI Analysis</SelectItem>
                  <SelectItem value="budget">Budget Overview</SelectItem>
                  <SelectItem value="conversions">Conversion Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date Range</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <Label htmlFor="campaigns">Campaigns</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="paused">Paused Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No saved reports yet</p>
              <p className="text-sm">Create your first report to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{report.name}</h3>
                      <Badge variant="outline">{report.type}</Badge>
                      {report.isScheduled && (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last generated: {new Date(report.lastGenerated).toLocaleString()}
                    </p>
                    {report.schedule && (
                      <p className="text-xs text-muted-foreground">
                        Schedule: {report.schedule}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Regenerate
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