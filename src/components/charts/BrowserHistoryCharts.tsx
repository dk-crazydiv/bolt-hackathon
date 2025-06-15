import React, { useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { BrowserHistoryAnalyzer } from '../../utils/browserHistoryAnalyzer';
import { DeviceWiseBrowserCharts } from './DeviceWiseBrowserCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Globe, Clock, TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

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
  const { getPageData } = useDataStore();
  const data = getPageData('browserHistory');
  const deviceData = getPageData('deviceInfo'); // Get device info data
  const { loadPageDataFromDB } = useDataStore();
  
  // Load data from IndexedDB if we only have metadata
  React.useEffect(() => {
    const loadFullData = async () => {
      if (data && !data.data && (data as any)._hasDataInIndexedDB) {
        console.log('🔄 Loading full data from IndexedDB for browser history...');
        await loadPageDataFromDB('browserHistory');
      }
    };
    
    loadFullData();
  }, [data, loadPageDataFromDB]);

  const analytics = useMemo(() => {
    if (propAnalytics) {
      return propAnalytics;
    }
    
    if (data && data.data) {
      console.log('🔍 BrowserHistoryCharts: Processing data for analysis...')
      console.log('📊 Data structure:', data.data)
      console.log('📊 Data type:', typeof data.data)
      console.log('📊 Data keys:', Object.keys(data.data || {}))
      
      const analyzer = new BrowserHistoryAnalyzer(data.data);
      const result = analyzer.analyze();
      console.log('✅ Analysis result:', result)
      console.log('📈 Top sites count:', result.topSites?.length || 0)
      console.log('🌐 Top domains count:', result.topDomains?.length || 0)
      return result;
    }
    
    console.log('⚠️ No data available for analysis:', { hasData: !!data, hasDataProperty: !!(data?.data) });
    return null;
  }, [propAnalytics, data]);

  // Show loading state while data is being loaded from IndexedDB
  if (data && !data.data && (data as any)._hasDataInIndexedDB) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <CardTitle className="mb-2">Loading data...</CardTitle>
            <CardDescription>
              Loading your browser history data from storage...
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }
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

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Processing data...</CardTitle>
            <CardDescription>
              Analyzing your browser history data. Please wait...
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasValidData = analytics.topSites && analytics.topSites.length > 0;

  if (!hasValidData) {
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
              <p className="text-xs text-muted-foreground">Raw records found</p>
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
            <CardTitle>⚠️ No Valid Browser History Found</CardTitle>
            <CardDescription>
              The uploaded file contains {data.metadata.totalRecords.toLocaleString()} records, but no valid browser history entries were found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">🔍 Debug Information:</h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <div>Data available: {data.data ? 'Yes' : 'No'}</div>
                  <div>Data type: {typeof data.data}</div>
                  {data.data && (
                    <div>Data keys: {Object.keys(data.data).join(', ')}</div>
                  )}
                  <div>Total records in metadata: {data.metadata.totalRecords}</div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Expected Data Format:</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Chrome: Export from chrome://history/ or Google Takeout</li>
                  <li>• Firefox: Export from browser history</li>
                  <li>• Should contain URLs, titles, and visit timestamps</li>
                  <li>• JSON format with visit records</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Data Structure Found:</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {data.metadata.fileStructure.slice(0, 10).map((structure, index) => (
                    <div key={index} className="font-mono">{structure}</div>
                  ))}
                  {data.metadata.fileStructure.length > 10 && (
                    <div className="text-xs">... and {data.metadata.fileStructure.length - 10} more fields</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🌐 Total Visits</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStats.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Page visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📄 Unique Sites</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStats.totalSites.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Different URLs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏢 Domains</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStats.totalDomains}</div>
            <p className="text-xs text-muted-foreground">Different domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📊 Avg Visits/Site</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStats.avgVisitsPerSite.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">⌨️ Most Typed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={analytics.totalStats.mostTypedSite}>
              {analytics.totalStats.mostTypedSite}
            </div>
            <p className="text-xs text-muted-foreground">Direct entry</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="sites">🌐 Top Sites</TabsTrigger>
          <TabsTrigger value="domains">🏢 Domains</TabsTrigger>
          <TabsTrigger value="patterns">📈 Patterns</TabsTrigger>
          <TabsTrigger value="devices">📱 Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Daily Browsing Activity</CardTitle>
                <CardDescription>Your browsing activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analytics.dailyActivity.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🕐 Hourly Activity Pattern</CardTitle>
                <CardDescription>When you browse the most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Top 20 Most Visited Sites</CardTitle>
              <CardDescription>Your most frequently visited websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.topSites.slice(0, 20).map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={site.title}>
                        {site.title || site.url}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" title={site.url}>
                        {site.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline">
                        {site.visitCount} visits
                      </Badge>
                      {site.typedCount > 0 && (
                        <Badge variant="secondary">
                          {site.typedCount} typed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🏢 Top Domains</CardTitle>
                <CardDescription>Most visited domains by visit count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.topDomains.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ domain, visitCount }) => `${domain}: ${visitCount}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visitCount"
                    >
                      {analytics.topDomains.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Domain Statistics</CardTitle>
                <CardDescription>Detailed domain breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analytics.topDomains.slice(0, 15).map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{domain.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          {domain.urls.length} unique pages
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">
                          {domain.visitCount} visits
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last: {domain.lastVisit.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 Weekly Browsing Pattern</CardTitle>
              <CardDescription>Your browsing habits by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔍 Browsing Insights</CardTitle>
              <CardDescription>Key patterns and behaviors from your browsing data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 Activity Summary</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Total browsing sessions: {analytics.sessions.length}</li>
                    <li>• Average session length: {analytics.sessions.length > 0 ? Math.round(analytics.sessions.reduce((sum, s) => sum + s.duration, 0) / analytics.sessions.length / 60000) : 0} minutes</li>
                    <li>• Most active day: {analytics.weeklyPattern.reduce((max, day) => day.visits > max.visits ? day : max, { day: 'None', visits: 0 }).day}</li>
                    <li>• Peak browsing hour: {analytics.hourlyActivity.reduce((max, hour) => hour.visits > max.visits ? hour : max, { hour: 0, visits: 0 }).hour}:00</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🏆 Top Preferences</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Most visited domain: {analytics.topDomains[0]?.domain || 'None'}</li>
                    <li>• Most typed site: {analytics.totalStats.mostTypedSite}</li>
                    <li>• Unique sites visited: {analytics.totalStats.totalSites}</li>
                    <li>• Different domains: {analytics.totalStats.totalDomains}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <DeviceWiseBrowserCharts 
            deviceData={deviceData?.data} 
            browserData={data?.data} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { BrowserHistoryCharts };