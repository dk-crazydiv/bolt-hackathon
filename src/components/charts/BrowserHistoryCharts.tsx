// Enhanced browser history charts with better error handling and debugging
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

// Enhanced component with comprehensive debugging and fallbacks
export default function BrowserHistoryCharts({ analytics: propAnalytics }: BrowserHistoryChartsProps) {
  const { getPageData } = useDataStore();
  const data = getPageData('browserHistory');
  const deviceData = getPageData('deviceInfo'); // Get device info data
  const { loadPageDataFromDB } = useDataStore();
  
  console.log('🔍 === BROWSER HISTORY CHARTS DEBUG ===');
  console.log('🔍 === ENHANCED CHART COMPONENT INITIALIZATION ===');
  console.log('🔍 Raw data from store:', {
    browserData: data ? 'Present' : 'Missing',
    deviceData: deviceData ? 'Present' : 'Missing',
    browserDataHasData: data?.data ? 'Yes' : 'No',
    deviceDataHasData: deviceData?.data ? 'Yes' : 'No',
    browserDataType: data?.type,
    browserDataSize: data?.size,
    browserDataRecords: data?.metadata?.totalRecords,
    browserDataStructure: data?.metadata?.fileStructure?.slice(0, 5)
  });
  
  // Log the actual data structure being passed to analyzer
  console.log('🔍 === DETAILED DATA STRUCTURE ANALYSIS ===');
  if (data?.data) {
    console.log('🔍 Actual browser data structure:', {
      dataType: typeof data.data,
      isArray: Array.isArray(data.data),
      dataKeys: typeof data.data === 'object' ? Object.keys(data.data) : 'not object',
      dataLength: Array.isArray(data.data) ? data.data.length : 'not array',
      sampleData: Array.isArray(data.data) ? data.data[0] : data.data
    });
    
    // Enhanced nested structure logging
    // Check for nested structures
    if (typeof data.data === 'object' && !Array.isArray(data.data)) {
      Object.entries(data.data).forEach(([key, value]) => {
        console.log(`🔍   ${key}:`, {
          type: typeof value,
          isArray: Array.isArray(value),
          length: Array.isArray(value) ? value.length : 'not array',
          sample: Array.isArray(value) && value.length > 0 ? value[0] : value
        });
      });
    }
  }
  
  // Enhanced data loading from IndexedDB
  // Load data from IndexedDB if we only have metadata
  React.useEffect(() => {
    const loadFullData = async () => {
      if (data && !data.data && (data as any)._hasDataInIndexedDB) {
        console.log('🔄 Loading full data from IndexedDB for browser history...');
        await loadPageDataFromDB('browserHistory');
      }
      if (deviceData && !deviceData.data && (deviceData as any)._hasDataInIndexedDB) {
        console.log('🔄 Loading full device data from IndexedDB...');
        await loadPageDataFromDB('deviceInfo');
      }
    };
    
    loadFullData();
  }, [data, deviceData, loadPageDataFromDB]);

  // Enhanced analytics processing with better error handling
  const analytics = useMemo(() => {
    if (propAnalytics) {
      console.log('🔍 Using prop analytics:', propAnalytics);
      return propAnalytics;
    }
    
    if (data && data.data) {
      console.log('🔍 === ENHANCED ANALYSIS PIPELINE ===');
      console.log('🔍 === STARTING BROWSER HISTORY ANALYSIS ===');
      console.log('🔍 Processing data for analysis...');
      console.log('📊 Raw data passed to analyzer:', {
        type: typeof data.data,
        isArray: Array.isArray(data.data),
        keys: typeof data.data === 'object' ? Object.keys(data.data) : 'not object',
        length: Array.isArray(data.data) ? data.data.length : 'not array'
      });
      
      try {
      const analyzer = new BrowserHistoryAnalyzer(data.data);
      const result = analyzer.analyze();
      
      
      console.log('✅ === ANALYSIS RESULT SUMMARY ===');
      console.log('📈 Analysis completed with results:', {
        topSitesCount: result.topSites?.length || 0,
        topDomainsCount: result.topDomains?.length || 0,
        dailyActivityCount: result.dailyActivity?.length || 0,
        hourlyActivityCount: result.hourlyActivity?.length || 0,
        weeklyPatternCount: result.weeklyPattern?.length || 0,
        totalVisits: result.totalStats?.totalVisits || 0,
        totalSites: result.totalStats?.totalSites || 0
      });
      
      // Enhanced chart data validation
      // Log sample data for charts
      if (result.dailyActivity && result.dailyActivity.length > 0) {
        console.log('📊 Sample daily activity for charts:', result.dailyActivity.slice(0, 3));
        console.log('📊 Daily activity date range:', {
          first: result.dailyActivity[0]?.date,
          last: result.dailyActivity[result.dailyActivity.length - 1]?.date,
          validEntries: result.dailyActivity.filter(d => d.date && d.visits > 0).length
        });
      } else {
        console.log('❌ No daily activity data generated');
      }
      
      if (result.hourlyActivity && result.hourlyActivity.length > 0) {
        console.log('📊 Sample hourly activity for charts:', result.hourlyActivity.filter(h => h.visits > 0).slice(0, 3));
        console.log('📊 Total hourly visits:', result.hourlyActivity.reduce((sum, h) => sum + h.visits, 0));
      } else {
        console.log('❌ No hourly activity data generated');
      }
      
      return result;
      } catch (error) {
        console.error('❌ Error during analysis:', error);
        console.error('❌ Data that caused error:', data.data);
        return null;
      }
      
    }
    
    console.log('❌ No data available for analysis:', { 
      hasData: !!data, 
      hasDataProperty: !!(data?.data),
      dataType: data?.type,
      dataSize: data?.size 
    });
    return null;
  }, [propAnalytics, data]);

  // Enhanced loading state handling
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

  // Enhanced error state handling
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

  // Enhanced data validation
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

  // Enhanced chart rendering with better validation
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
          <Card>
            {/* Enhanced timeline chart with better data validation */}
            <CardHeader>
              <CardTitle>🕐 Browser Usage Timeline</CardTitle>
              <CardDescription>Complete timeline showing browser usage frequency over time</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                console.log('🔍 Timeline Chart Debug:', {
                  // Enhanced timeline debugging
                  hasAnalytics: !!analytics,
                  hasDailyActivity: !!(analytics?.dailyActivity),
                  dailyActivityLength: analytics?.dailyActivity?.length || 0,
                  sampleDailyActivity: analytics?.dailyActivity?.slice(0, 2) || [],
                  totalVisits: analytics?.totalStats?.totalVisits || 0
                })
                
                // Better data validation for timeline
                const timelineData = analytics?.dailyActivity || []
                const hasValidTimelineData = timelineData.length > 0 && 
                  timelineData.some(item => item.date && item.visits > 0)
                
                console.log('📊 Timeline validation:', {
                  hasValidTimelineData,
                  firstValidItem: timelineData.find(item => item.date && item.visits > 0)
                })
                
                return hasValidTimelineData
              })() ? (
                <ResponsiveContainer width="100%" height={300}>
                  {/* Enhanced timeline chart with better formatting */}
                  <AreaChart data={analytics.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Browser Sessions', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value)
                        return `Date: ${date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}`
                      }}
                      formatter={(value, name) => [
                        `${value} ${name === 'visits' ? 'browser sessions' : name}`,
                        'Usage Count'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                  {/* Enhanced error state for timeline */}
                    {/* Enhanced error state */}
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No timeline data available</p>
                    <p className="text-xs">
                      {analytics?.totalStats?.totalVisits > 0 
                        ? 'Processing timeline data...' 
                        : 'Upload browser history data to see usage timeline'
                      }
                    </p>
                    {analytics?.dailyActivity && (
                      <p className="text-xs mt-2 text-blue-600">
                        Debug: Found {analytics.dailyActivity.length} daily entries
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                {/* Enhanced daily activity chart */}
                <CardTitle>📈 Recent Daily Activity</CardTitle>
                <CardDescription>Your browsing activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.dailyActivity && analytics.dailyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analytics.dailyActivity.slice(-30)}>
                    {/* Better chart configuration */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value, name) => [value, name === 'visits' ? 'Visits' : name]}
                    />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                ) : (
                  {/* Enhanced error state */}
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No daily activity data available</p>
                      <p className="text-xs">Data: {analytics.dailyActivity?.length || 0} days</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                {/* Enhanced hourly activity chart */}
                <CardTitle>🕐 Hourly Activity Pattern</CardTitle>
                <CardDescription>When you browse the most</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.hourlyActivity && analytics.hourlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.hourlyActivity}>
                    {/* Better chart styling */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `Hour: ${value}:00`}
                      formatter={(value, name) => [value, name === 'visits' ? 'Visits' : name]}
                    />
                    <Bar dataKey="visits" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    {/* Enhanced error state */}
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No hourly activity data available</p>
                      <p className="text-xs">Data: {analytics.hourlyActivity?.length || 0} hours</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Debug Information Card */}
          {/* Enhanced debug information */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Data Debug Information</CardTitle>
              <CardDescription>Debugging information for chart data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Better debug layout */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                  <h4 className="font-semibold mb-2">📊 Analytics Data</h4>
                  <div className="space-y-1">
                    <div>Daily Activity: {analytics.dailyActivity?.length || 0} entries</div>
                    <div>Hourly Activity: {analytics.hourlyActivity?.length || 0} entries</div>
                    <div>Top Sites: {analytics.topSites?.length || 0} sites</div>
                    <div>Top Domains: {analytics.topDomains?.length || 0} domains</div>
                    <div>Sessions: {analytics.sessions?.length || 0} sessions</div>
                  </div>
                </div>
                
                {/* Enhanced sample data display */}
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                  <h4 className="font-semibold mb-2">📈 Sample Data</h4>
                  <div className="space-y-1 text-xs">
                    {analytics.dailyActivity && analytics.dailyActivity.length > 0 && (
                      <div>
                        <div className="font-medium">Daily Sample:</div>
                        <div className="font-mono">
                          {JSON.stringify(analytics.dailyActivity[0], null, 2).slice(0, 100)}...
                        </div>
                      </div>
                    )}
                    {analytics.hourlyActivity && analytics.hourlyActivity.length > 0 && (
                      <div>
                        <div className="font-medium">Hourly Sample:</div>
                        <div className="font-mono">
                          {JSON.stringify(analytics.hourlyActivity[0], null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <Card>
            {/* Enhanced sites display */}
            <CardHeader>
              <CardTitle>🏆 Top 20 Most Visited Sites</CardTitle>
              <CardDescription>Your most frequently visited websites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.topSites.slice(0, 20).map((site, index) => (
                  {/* Better site display formatting */}
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
              {/* Enhanced domain charts */}
              <CardHeader>
                <CardTitle>🏢 Top Domains</CardTitle>
                <CardDescription>Most visited domains by visit count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    {/* Better pie chart configuration */}
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
                {/* Enhanced domain statistics */}
                <CardTitle>📊 Domain Statistics</CardTitle>
                <CardDescription>Detailed domain breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analytics.topDomains.slice(0, 15).map((domain, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      {/* Better domain display */}
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
            {/* Enhanced weekly pattern chart */}
            <CardHeader>
              <CardTitle>📅 Weekly Browsing Pattern</CardTitle>
              <CardDescription>Your browsing habits by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.weeklyPattern}>
                  {/* Better weekly chart styling */}
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
              {/* Enhanced insights section */}
              <CardTitle>🔍 Browsing Insights</CardTitle>
              <CardDescription>Key patterns and behaviors from your browsing data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 Activity Summary</h4>
                  {/* Better insights calculation */}
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Total browsing sessions: {analytics.sessions.length}</li>
                    <li>• Average session length: {analytics.sessions.length > 0 ? Math.round(analytics.sessions.reduce((sum, s) => sum + s.duration, 0) / analytics.sessions.length / 60000) : 0} minutes</li>
                    <li>• Most active day: {analytics.weeklyPattern.reduce((max, day) => day.visits > max.visits ? day : max, { day: 'None', visits: 0 }).day}</li>
                    <li>• Peak browsing hour: {analytics.hourlyActivity.reduce((max, hour) => hour.visits > max.visits ? hour : max, { hour: 0, visits: 0 }).hour}:00</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🏆 Top Preferences</h4>
                  {/* Enhanced preferences display */}
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
          {/* Enhanced device charts integration */}
          <DeviceWiseBrowserCharts 
            deviceData={deviceData?.data || null} 
            browserData={data?.data} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { BrowserHistoryCharts };