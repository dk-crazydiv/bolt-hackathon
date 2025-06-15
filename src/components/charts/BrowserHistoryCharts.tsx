import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Clock, TrendingUp, BarChart3, PieChart, Calendar, Activity } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { BrowserHistoryAnalyzer, BrowserAnalytics } from '@/utils/browserHistoryAnalyzer'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export const BrowserHistoryCharts: React.FC = () => {
  const { getPageData } = useDataStore()
  const data = getPageData('browserHistory')
  const [activeTab, setActiveTab] = useState('overview')

  const analytics: BrowserAnalytics | null = useMemo(() => {
    if (!data) return null
    
    try {
      const analyzer = new BrowserHistoryAnalyzer(data.data)
      return analyzer.analyze()
    } catch (error) {
      console.error('Error analyzing browser history:', error)
      return null
    }
  }, [data])

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
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Unable to analyze data</CardTitle>
            <CardDescription>The uploaded data format is not supported or contains errors.</CardDescription>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const totalSessions = analytics.sessions.length
  const avgSessionDuration = analytics.sessions.length > 0 
    ? analytics.sessions.reduce((sum, s) => sum + s.duration, 0) / analytics.sessions.length 
    : 0
  const totalVisits = analytics.topSites.reduce((sum, site) => sum + site.visitCount, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all sites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topDomains.length}</div>
            <p className="text-xs text-muted-foreground">Different websites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Browsing sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Top Domains
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Most Visited Sites</CardTitle>
                <CardDescription>Sites ranked by visit frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topSites.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="domain" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Visits']}
                      labelFormatter={(label) => `Domain: ${label}`}
                    />
                    <Bar dataKey="visitCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Browsing Activity</CardTitle>
                <CardDescription>Visits per day over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyActivity.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name) => [value, name === 'visits' ? 'Visits' : 'Duration (min)']}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain Distribution</CardTitle>
                <CardDescription>Visit distribution across top domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value, name) => [value, 'Visits']} />
                    <RechartsPieChart data={analytics.topDomains.slice(0, 8)}>
                      {analytics.topDomains.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Domains Details</CardTitle>
                <CardDescription>Detailed statistics for most visited domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.topDomains.slice(0, 10).map((domain, index) => (
                    <div key={domain.domain} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <p className="text-sm text-muted-foreground">
                            {domain.urls.length} unique pages
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{domain.visitCount} visits</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {domain.lastVisit.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Duration Distribution</CardTitle>
                <CardDescription>How long your browsing sessions typically last</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={
                    analytics.sessions
                      .map(s => ({ duration: Math.floor(s.duration / (1000 * 60 * 5)) * 5 })) // 5-minute buckets
                      .reduce((acc, curr) => {
                        const existing = acc.find(item => item.duration === curr.duration)
                        if (existing) {
                          existing.count++
                        } else {
                          acc.push({ duration: curr.duration, count: 1 })
                        }
                        return acc
                      }, [] as { duration: number; count: number }[])
                      .sort((a, b) => a.duration - b.duration)
                      .slice(0, 20)
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="duration" 
                      tickFormatter={(value) => `${value}m`}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Sessions']}
                      labelFormatter={(label) => `Duration: ${label} minutes`}
                    />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
                <CardDescription>Key metrics about your browsing sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{totalSessions}</div>
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{formatDuration(avgSessionDuration)}</div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {analytics.sessions.length > 0 
                          ? Math.round(analytics.sessions.reduce((sum, s) => sum + s.pageCount, 0) / analytics.sessions.length)
                          : 0
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Pages/Session</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatDuration(Math.max(...analytics.sessions.map(s => s.duration)))}
                      </div>
                      <div className="text-sm text-muted-foreground">Longest Session</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity Pattern</CardTitle>
                <CardDescription>Your browsing activity throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value, name) => [
                        Math.round(value as number), 
                        name === 'visits' ? 'Visits' : 'Avg Duration (min)'
                      ]}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Pattern</CardTitle>
                <CardDescription>Browsing habits across days of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.weeklyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, 'Visits']} />
                    <Bar dataKey="visits" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}