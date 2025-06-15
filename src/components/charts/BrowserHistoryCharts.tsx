import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BrowserHistoryChartsProps {
  analytics: {
    topSites: Array<{
      url: string;
      title?: string;
      visitCount: number;
    }>;
  };
}

export default function BrowserHistoryCharts({ analytics }: BrowserHistoryChartsProps) {
  const [selectedTimeUrl, setSelectedTimeUrl] = useState<string>('');

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