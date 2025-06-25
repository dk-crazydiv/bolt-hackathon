import React, { useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { BrowserHistoryAnalyzer } from '../../utils/browserHistoryAnalyzer';
import { DeviceWiseBrowserCharts } from './DeviceWiseBrowserCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  
  console.log('🔍 BrowserHistoryCharts: Data state check:', {
    browserData: data ? 'Present' : 'Missing',
    deviceData: deviceData ? 'Present' : 'Missing',
    browserDataHasData: data?.data ? 'Yes' : 'No',
    deviceDataHasData: deviceData?.data ? 'Yes' : 'No'
  });
  
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

  // Extract raw records for data table
  const rawRecords = useMemo(() => {
    if (!data?.data) return [];
    
    console.log('🔍 Extracting raw records from data:', data.data);
    
    let records: any[] = [];
    
    // Handle different data structures
    if (Array.isArray(data.data)) {
      records = data.data;
    } else if (data.data["Browser History"]) {
      const browserHistory = data.data["Browser History"];
      if (Array.isArray(browserHistory)) {
        records = browserHistory;
      } else if (typeof browserHistory === 'object') {
        // Look for arrays within Browser History
        for (const [key, value] of Object.entries(browserHistory)) {
          if (Array.isArray(value) && value.length > 0) {
            records = value;
            break;
          }
        }
      }
    } else if (typeof data.data === 'object') {
      // Look for common browser history patterns
      const possibleKeys = ['visits', 'history', 'browsing_history', 'browser_history', 'urls', 'sites', 'pages'];
      for (const key of possibleKeys) {
        if (data.data[key] && Array.isArray(data.data[key])) {
          records = data.data[key];
          break;
        }
      }
    }
    
    console.log('📊 Extracted records count:', records.length);
    return records.slice(0, 1000); // Limit to first 1000 records for performance
  }, [data]);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [recordsPerPage, setRecordsPerPage] = React.useState(25);
  
  // Calculate pagination
  const totalPages = Math.ceil(rawRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = rawRecords.slice(startIndex, endIndex);
  
  // Reset to first page when records per page changes
  const handleRecordsPerPageChange = (value: string) => {
    setRecordsPerPage(parseInt(value));
    setCurrentPage(1);
  };
  
  // Navigation functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

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
      console.log('📊 Daily activity count:', result.dailyActivity?.length || 0)
      console.log('📊 Hourly activity sample:', result.hourlyActivity?.slice(0, 3) || [])
      console.log('📊 Sample daily activity:', result.dailyActivity?.slice(0, 3) || [])
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
          <TabsTrigger value="data-table">📋 Data Table</TabsTrigger>
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="sites">🌐 Top Sites</TabsTrigger>
          <TabsTrigger value="domains">🏢 Domains</TabsTrigger>
          <TabsTrigger value="patterns">📈 Patterns</TabsTrigger>
          <TabsTrigger value="devices">📱 Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="data-table" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>📋 Browser History Data Table</CardTitle>
                  <CardDescription>
                    View all your browser history records in a simple table format. 
                    Total records: {rawRecords.length.toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Records per page:</span>
                  <Select value={recordsPerPage.toString()} onValueChange={handleRecordsPerPageChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rawRecords.length > 0 ? (
                <div className="space-y-4">
                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-medium text-sm">#</th>
                            <th className="text-left p-3 font-medium text-sm">URL</th>
                            <th className="text-left p-3 font-medium text-sm">Title</th>
                            <th className="text-left p-3 font-medium text-sm">Visit Time</th>
                            <th className="text-left p-3 font-medium text-sm">Visits</th>
                            <th className="text-left p-3 font-medium text-sm">Typed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((record, index) => {
                            const globalIndex = startIndex + index + 1;
                            const url = record.url || record.URL || record.uri || 'N/A';
                            const title = record.title || record.Title || record.page_title || 'No title';
                            const visitTime = record.time_usec || record.last_visit_time || record.visit_time || record.visitTime || record.timestamp;
                            const visitCount = record.visit_count || record.visitCount || 1;
                            const typedCount = record.typed_count || record.typedCount || 0;
                            
                            // Format timestamp - improved logic
                            let formattedTime = 'N/A';
                            let debugInfo = 'No time data';
                            if (visitTime) {
                              try {
                                // Log the first few records to understand the format
                                if (index < 3) {
                                  console.log(`🕐 Record ${index + 1} timestamp analysis:`, {
                                    raw: visitTime,
                                    type: typeof visitTime,
                                    length: visitTime.toString().length,
                                    sample: visitTime.toString().substring(0, 20)
                                  });
                                }
                                
                                let timestamp = visitTime;
                                
                                if (typeof timestamp === 'string') {
                                  // Try parsing as ISO string first
                                  const parsed = new Date(timestamp);
                                  if (!isNaN(parsed.getTime())) {
                                    formattedTime = parsed.toLocaleString();
                                    debugInfo = `String date: ${timestamp}`;
                                    if (index < 3) console.log('🕐 Parsed as ISO string:', formattedTime);
                                  } else {
                                    // Try parsing as number string
                                    const numericTimestamp = parseInt(timestamp);
                                    if (!isNaN(numericTimestamp)) {
                                      timestamp = numericTimestamp;
                                      debugInfo = `Parsed from string: ${numericTimestamp}`;
                                      if (index < 3) console.log('🕐 Converted string to number:', numericTimestamp);
                                    } else {
                                      formattedTime = timestamp; // Show as-is if can't parse
                                      debugInfo = `Unparseable string: ${timestamp}`;
                                      if (index < 3) console.log('🕐 Unparseable string:', timestamp);
                                    }
                                  }
                                }
                                
                                if (typeof timestamp === 'number') {
                                  if (index < 3) console.log('🕐 Processing numeric timestamp:', timestamp, 'Length:', timestamp.toString().length);
                                  
                                  // Determine timestamp format based on length and value
                                  const timestampStr = timestamp.toString();
                                  const timestampLength = timestampStr.length;
                                  
                                  if (timestampLength >= 17) {
                                    // Chrome timestamp in microseconds since 1601
                                    const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
                                    const jsTimestamp = Math.floor((timestamp - CHROME_EPOCH_OFFSET) / 1000);
                                    if (index < 3) console.log('🕐 Chrome µs (17+ digits):', timestamp, '->', jsTimestamp);
                                    timestamp = jsTimestamp;
                                    debugInfo = `Chrome µs (17+): ${visitTime} -> ${jsTimestamp}`;
                                  }
                                  else if (timestampLength === 16) {
                                    // Chrome timestamp in microseconds (16 digits)
                                    const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
                                    const jsTimestamp = Math.floor((timestamp - CHROME_EPOCH_OFFSET) / 1000);
                                    if (index < 3) console.log('🕐 Chrome µs (16 digits):', timestamp, '->', jsTimestamp);
                                    timestamp = jsTimestamp;
                                    debugInfo = `Chrome µs (16): ${visitTime} -> ${jsTimestamp}`;
                                  }
                                  else if (timestampLength === 15) {
                                    // Chrome timestamp in microseconds (15 digits)
                                    const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
                                    const jsTimestamp = Math.floor((timestamp - CHROME_EPOCH_OFFSET) / 1000);
                                    if (index < 3) console.log('🕐 Chrome µs (15 digits):', timestamp, '->', jsTimestamp);
                                    timestamp = jsTimestamp;
                                    debugInfo = `Chrome µs (15): ${visitTime} -> ${jsTimestamp}`;
                                  }
                                  else if (timestampLength === 14) {
                                    // Chrome timestamp in microseconds (14 digits)
                                    const CHROME_EPOCH_OFFSET = 11644473600000000; // microseconds
                                    const jsTimestamp = Math.floor((timestamp - CHROME_EPOCH_OFFSET) / 1000);
                                    if (index < 3) console.log('🕐 Chrome µs (14 digits):', timestamp, '->', jsTimestamp);
                                    timestamp = jsTimestamp;
                                    debugInfo = `Chrome µs (14): ${visitTime} -> ${jsTimestamp}`;
                                  }
                                  else if (timestampLength === 13) {
                                    // Unix timestamp in milliseconds
                                    if (index < 3) console.log('🕐 Unix milliseconds (13 digits):', timestamp);
                                    debugInfo = `Unix ms (13): ${timestamp}`;
                                  }
                                  else if (timestampLength === 10) {
                                    // Unix timestamp in seconds
                                    timestamp = timestamp * 1000;
                                    if (index < 3) console.log('🕐 Unix seconds (10 digits) -> ms:', timestamp);
                                    debugInfo = `Unix s->ms (10): ${visitTime} -> ${timestamp}`;
                                  }
                                  else if (timestampLength <= 9) {
                                    // Very small number - might be days or other format
                                    if (index < 3) console.log('🕐 Small number (≤9 digits), trying multiple formats:', timestamp);
                                    
                                    // Try as seconds first
                                    let testTimestamp = timestamp * 1000;
                                    let testDate = new Date(testTimestamp);
                                    
                                    if (testDate.getFullYear() >= 1990 && testDate.getFullYear() <= 2030) {
                                      timestamp = testTimestamp;
                                      debugInfo = `Small->seconds: ${visitTime} -> ${timestamp}`;
                                    } else {
                                      // Try as days since epoch
                                      testTimestamp = timestamp * 24 * 60 * 60 * 1000;
                                      testDate = new Date(testTimestamp);
                                      if (testDate.getFullYear() >= 1990 && testDate.getFullYear() <= 2030) {
                                        timestamp = testTimestamp;
                                        debugInfo = `Days since epoch: ${visitTime} -> ${timestamp}`;
                                      } else {
                                        // Try as milliseconds directly
                                        debugInfo = `Unknown small format: ${timestamp}`;
                                      }
                                    }
                                  }
                                  else {
                                    // Unusual length, try as-is
                                    if (index < 3) console.log('🕐 Unusual length, trying as-is:', timestamp);
                                    debugInfo = `Unusual length (${timestampLength}): ${timestamp}`;
                                  }
                                  
                                  const date = new Date(timestamp);
                                  if (!isNaN(date.getTime())) {
                                    formattedTime = date.toLocaleString();
                                    if (index < 3) console.log('🕐 Final formatted time:', formattedTime);
                                  } else {
                                    formattedTime = visitTime.toString();
                                    debugInfo = `Invalid date: ${timestamp}`;
                                    if (index < 3) console.log('🕐 Invalid date result:', timestamp);
                                  }
                                }
                              } catch (e) {
                                console.warn('Failed to parse timestamp:', visitTime, e);
                                formattedTime = visitTime.toString();
                                debugInfo = `Error: ${e.message}`;
                              }
                            }
                            
                            return (
                              <tr key={index} className="border-t hover:bg-muted/30">
                                <td className="p-3 text-sm text-muted-foreground">{globalIndex}</td>
                                <td className="p-3 text-sm">
                                  <div className="max-w-xs truncate font-mono" title={url}>
                                    {url}
                                  </div>
                                </td>
                                <td className="p-3 text-sm">
                                  <div className="max-w-xs truncate" title={title}>
                                    {title}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">
                                  <div className="max-w-xs truncate" title={`Original: ${visitTime} | ${debugInfo} | Formatted: ${formattedTime}`}>
                                    {formattedTime}
                                  </div>
                                </td>
                                <td className="p-3 text-sm text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {visitCount}
                                  </Badge>
                                </td>
                                <td className="p-3 text-sm text-center">
                                  {typedCount > 0 ? (
                                    <Badge variant="secondary" className="text-xs">
                                      {typedCount}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, rawRecords.length)} of {rawRecords.length.toLocaleString()} records
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Page</span>
                          <Badge variant="outline" className="px-2 py-1">
                            {currentPage} of {totalPages}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4" />
                  <p>No raw records found in the data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            {/* Monthly Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Monthly Browsing Timeline</CardTitle>
                <CardDescription>Total visits grouped by month across your entire browsing history</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Generate monthly data from daily activity
                  const monthlyData = React.useMemo(() => {
                    if (!analytics.dailyActivity || analytics.dailyActivity.length === 0) return [];
                    
                    const monthlyMap = new Map<string, number>();
                    
                    analytics.dailyActivity.forEach(day => {
                      if (!day.date) return;
                      
                      try {
                        const date = new Date(day.date);
                        if (isNaN(date.getTime())) return;
                        
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + (day.visits || 0));
                      } catch (e) {
                        console.warn('Failed to process date:', day.date, e);
                      }
                    });
                    
                    const sortedMonths = Array.from(monthlyMap.entries())
                      .map(([month, visits]) => ({
                        month,
                        visits,
                        displayMonth: (() => {
                          try {
                            const [year, monthNum] = month.split('-');
                            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                          } catch {
                            return month;
                          }
                        })()
                      }))
                      .sort((a, b) => a.month.localeCompare(b.month));
                    
                    console.log('📊 Monthly data generated:', sortedMonths.length, 'months');
                    console.log('📊 Sample monthly data:', sortedMonths.slice(0, 3));
                    
                    return sortedMonths;
                  }, [analytics.dailyActivity]);
                  
                  return monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="displayMonth" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={Math.max(1, Math.floor(monthlyData.length / 12))}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => `Month: ${value}`}
                          formatter={(value, name) => [value?.toLocaleString(), 'Total Visits']}
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
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No monthly activity data available</p>
                        <p className="text-xs">Daily activity: {analytics.dailyActivity?.length || 0} days</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            {/* Daily and Hourly Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Recent Daily Activity</CardTitle>
                  <CardDescription>Your browsing activity over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.dailyActivity && analytics.dailyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analytics.dailyActivity.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } catch {
                            return value;
                          }
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => {
                          try {
                            return `Date: ${new Date(value).toLocaleDateString()}`;
                          } catch {
                            return `Date: ${value}`;
                          }
                        }}
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
                  <CardTitle>🕐 Hourly Activity Pattern</CardTitle>
                  <CardDescription>When you browse the most throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Enhanced hourly activity processing
                    const hourlyData = React.useMemo(() => {
                      if (!analytics.hourlyActivity || analytics.hourlyActivity.length === 0) {
                        console.log('⚠️ No hourly activity data available');
                        return [];
                      }
                      
                      console.log('📊 Processing hourly activity:', analytics.hourlyActivity.length, 'entries');
                      console.log('📊 Sample hourly data:', analytics.hourlyActivity.slice(0, 3));
                      
                      // Ensure we have all 24 hours and format properly
                      const processedHourly = Array.from({ length: 24 }, (_, hour) => {
                        const existingData = analytics.hourlyActivity.find(h => h.hour === hour);
                        const visits = existingData?.visits || 0;
                        
                        return {
                          hour,
                          visits,
                          displayHour: `${hour.toString().padStart(2, '0')}:00`,
                          timeLabel: hour === 0 ? '12 AM' : 
                                   hour < 12 ? `${hour} AM` : 
                                   hour === 12 ? '12 PM' : 
                                   `${hour - 12} PM`
                        };
                      });
                      
                      const totalVisits = processedHourly.reduce((sum, h) => sum + h.visits, 0);
                      console.log('📊 Processed hourly data - Total visits:', totalVisits);
                      console.log('📊 Peak hours:', processedHourly
                        .sort((a, b) => b.visits - a.visits)
                        .slice(0, 3)
                        .map(h => `${h.timeLabel}: ${h.visits}`)
                      );
                      
                      return processedHourly;
                    }, [analytics.hourlyActivity]);
                    
                    return hourlyData.length > 0 && hourlyData.some(h => h.visits > 0) ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timeLabel" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={1}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => `Time: ${value}`}
                            formatter={(value, name) => [value?.toLocaleString(), 'Visits']}
                          />
                          <Bar 
                            dataKey="visits" 
                            fill="#10b981"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                        <div className="text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No hourly activity data available</p>
                          <p className="text-xs">
                            Data: {analytics.hourlyActivity?.length || 0} hours | 
                            Total visits: {hourlyData.reduce((sum, h) => sum + h.visits, 0)}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
            
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📊 Browsing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Days:</span>
                    <Badge variant="outline">{analytics.dailyActivity?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Months:</span>
                    <Badge variant="outline">
                      {(() => {
                        if (!analytics.dailyActivity || analytics.dailyActivity.length === 0) return 0;
                        const months = new Set(analytics.dailyActivity.map(day => {
                          try {
                            const date = new Date(day.date);
                            return `${date.getFullYear()}-${date.getMonth()}`;
                          } catch {
                            return null;
                          }
                        }).filter(Boolean));
                        return months.size;
                      })()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Peak Hour:</span>
                    <Badge variant="secondary">
                      {(() => {
                        if (!analytics.hourlyActivity || analytics.hourlyActivity.length === 0) return 'N/A';
                        const peakHour = analytics.hourlyActivity.reduce((max, hour) => 
                          hour.visits > max.visits ? hour : max, { hour: 0, visits: 0 }
                        );
                        return peakHour.hour === 0 ? '12 AM' : 
                               peakHour.hour < 12 ? `${peakHour.hour} AM` : 
                               peakHour.hour === 12 ? '12 PM' : 
                               `${peakHour.hour - 12} PM`;
                      })()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🏆 Top Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Busiest Day:</span>
                    <Badge variant="outline">
                      {(() => {
                        if (!analytics.dailyActivity || analytics.dailyActivity.length === 0) return 'N/A';
                        const busiestDay = analytics.dailyActivity.reduce((max, day) => 
                          day.visits > max.visits ? day : max, { date: '', visits: 0 }
                        );
                        try {
                          return new Date(busiestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Most Active Day:</span>
                    <Badge variant="secondary">
                      {analytics.weeklyPattern?.reduce((max, day) => 
                        day.visits > max.visits ? day : max, { day: 'None', visits: 0 }
                      ).day || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Daily Visits:</span>
                    <Badge variant="outline">
                      {(() => {
                        if (!analytics.dailyActivity || analytics.dailyActivity.length === 0) return '0';
                        const totalVisits = analytics.dailyActivity.reduce((sum, day) => sum + day.visits, 0);
                        return Math.round(totalVisits / analytics.dailyActivity.length).toLocaleString();
                      })()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📈 Trends</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Data Range:</span>
                    <Badge variant="outline">
                      {(() => {
                        if (!analytics.dailyActivity || analytics.dailyActivity.length === 0) return 'N/A';
                        const dates = analytics.dailyActivity.map(d => new Date(d.date)).filter(d => !isNaN(d.getTime()));
                        if (dates.length === 0) return 'N/A';
                        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
                        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
                        const daysDiff = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
                        return `${daysDiff} days`;
                      })()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sessions:</span>
                    <Badge variant="secondary">{analytics.sessions?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Session:</span>
                    <Badge variant="outline">
                      {(() => {
                        if (!analytics.sessions || analytics.sessions.length === 0) return '0 min';
                        const avgDuration = analytics.sessions.reduce((sum, s) => sum + s.duration, 0) / analytics.sessions.length;
                        return `${Math.round(avgDuration / 60000)} min`;
                      })()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Debug Information Card - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Data Analysis Debug</CardTitle>
              <CardDescription>Detailed information about your browsing data processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded">
                  <h4 className="font-semibold mb-2">🔢 Statistics</h4>
                  <div className="space-y-1">
                    <div>Total Hourly Visits: {analytics.hourlyActivity?.reduce((sum, h) => sum + h.visits, 0) || 0}</div>
                    <div>Total Daily Visits: {analytics.dailyActivity?.reduce((sum, d) => sum + d.visits, 0) || 0}</div>
                    <div>Peak Hour Visits: {analytics.hourlyActivity?.reduce((max, h) => Math.max(max, h.visits), 0) || 0}</div>
                    <div>Peak Day Visits: {analytics.dailyActivity?.reduce((max, d) => Math.max(max, d.visits), 0) || 0}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
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