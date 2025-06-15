import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { BrowserHistoryAnalyzer } from '../../utils/browserHistoryAnalyzer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Globe, Clock, TrendingUp } from 'lucide-react';

interface BrowserHistoryChartsProps {
  analytics?: {
    topSites: Array<{
      url: string;
      title?: string;
      visitCount: number;
    }>;
  };
}

export default function BrowserHistoryCharts({ analytics: propAnalytics }: BrowserHistoryChartsProps) {
  const [selectedTimeUrl, setSelectedTimeUrl] = useState<string>('');
  const { getPageData } = useDataStore();
  const data = getPageData('browserHistory');

  const analytics = useMemo(() => {
    if (propAnalytics) {
      return propAnalytics;
    }
    
    if (data && data.data) {
      const analyzer = new BrowserHistoryAnalyzer(data.data);
      return analyzer.analyze();
    }
    
    return null;
  }, [propAnalytics, data]);

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No data uploaded</CardTitle>
            <CardDescription>Upload your browser history data to see visualizations.</CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || !analytics.topSites || analytics.topSites.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No browsing data found</CardTitle>
            <CardDescription>
              Unable to analyze browser history. Please ensure your data contains valid browsing records.
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metadata.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Browsing records</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Size</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.size / 1024 / 1024).toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">Data processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Type</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.type.toUpperCase()}</div>
            <p className="text-xs text-muted-foreground">Format detected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Browser History Analysis</CardTitle>
          <CardDescription>
            Advanced charts and visualizations for your browsing data will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedTimeUrl} onValueChange={setSelectedTimeUrl}>
              <SelectTrigger>
                <SelectValue placeholder="Select a URL to analyze" />
              </SelectTrigger>
              <SelectContent>
                {analytics.topSites.slice(0, 10).map(site => (
                  <SelectItem key={site.url} value={site.url}>
                    {site.title || site.url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Browser analysis features coming soon:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">Top visited sites</Badge>
              <Badge variant="outline">Browsing patterns</Badge>
              <Badge variant="outline">Time-based analysis</Badge>
              <Badge variant="outline">Session tracking</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { BrowserHistoryCharts };