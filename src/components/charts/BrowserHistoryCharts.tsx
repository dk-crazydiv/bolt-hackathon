import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { analyzeBrowserHistory } from '../../utils/browserHistoryAnalyzer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
  const { data } = useDataStore();

  const analytics = useMemo(() => {
    if (propAnalytics) {
      return propAnalytics;
    }
    
    if (data.browserHistory && data.browserHistory.length > 0) {
      return analyzeBrowserHistory(data.browserHistory);
    }
    
    return null;
  }, [propAnalytics, data.browserHistory]);

  if (!analytics || !analytics.topSites || analytics.topSites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No browser history data available. Please upload your data first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}

export { BrowserHistoryCharts }