import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Globe, Clock, TrendingUp, BarChart3, PieChart, Calendar, Activity, 
  Star, Bookmark, Search, Timer, MapPin, Zap, Target, Award,
  MousePointer, Eye, Heart, Flame, Trophy, Sparkles
} from 'lucide-react'
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
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

interface InsightTileProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: string
  trend?: string
  onClick?: () => void
}

const InsightTile: React.FC<InsightTileProps> = ({ 
  title, value, subtitle, icon, color, trend, onClick 
}) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${onClick ? 'hover:bg-accent/50' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        {trend && (
          <Badge variant="secondary" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </CardContent>
  </Card>
)

export const BrowserHistoryCharts: React.FC = () => {
  const { getPageData } = useDataStore()
  const data = getPageData('browserHistory')
  const [activeTab, setActiveTab] = useState('tiles')
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  const analytics: BrowserAnalytics | null = useMemo(() => {
    if (!data) return null
    
    try {
      console.log('Raw data structure:', data)
      
      const analyzer = new BrowserHistoryAnalyzer(data.data)
      const result = analyzer.analyze()
      console.log('Analytics result:', result)
      console.log('Sessions found:', result.sessions.length)
      console.log('Total visits:', result.totalStats.totalVisits)
      return result
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
  const topDomain = analytics.topDomains[0]
  const mostTypedSite = analytics.topSites.reduce((max, site) => 
    site.typedCount > max.typedCount ? site : max, 
    { typedCount: 0, url: 'None', title: 'None' }
  )
  const longestSession = Math.max(...analytics.sessions.map(s => s.duration))
  const mostActiveHour = analytics.hourlyActivity.reduce((max, hour) => 
    hour.visits > max.visits ? hour : max, analytics.hourlyActivity[0] || { hour: 0, visits: 0 }
  )
  const mostActiveDay = analytics.weeklyPattern.reduce((max, day) => 
    day.visits > max.visits ? day : max, analytics.weeklyPattern[0] || { day: 'Monday', visits: 0 }
  )

  // Calculate interesting insights
  const uniqueDomains = analytics.topDomains.length
  const avgPagesPerSession = analytics.sessions.length > 0 
    ? Math.round(analytics.sessions.reduce((sum, s) => sum + s.pageCount, 0) / analytics.sessions.length)
    : 0
  const totalBrowsingTime = analytics.sessions.reduce((sum, s) => sum + s.duration, 0)
  const nightOwlScore = analytics.hourlyActivity.filter(h => h.hour >= 22 || h.hour <= 6)
    .reduce((sum, h) => sum + h.visits, 0)
  const workHoursScore = analytics.hourlyActivity.filter(h => h.hour >= 9 && h.hour <= 17)
    .reduce((sum, h) => sum + h.visits, 0)
  
  const insightTiles = [
    {
      title: "Total Web Visits",
      value: totalVisits.toLocaleString(),
      subtitle: "Pages visited across all sites",
      icon: <MousePointer className="h-6 w-6 text-white" />,
      color: "bg-blue-500",
      trend: "All time"
    },
    {
      title: "Favorite Website",
      value: topDomain?.domain || "N/A",
      subtitle: `${topDomain?.visitCount || 0} visits • ${topDomain?.urls.length || 0} pages`,
      icon: <Heart className="h-6 w-6 text-white" />,
      color: "bg-red-500",
      trend: "Most visited"
    },
    {
      title: "Browsing Sessions",
      value: totalSessions.toLocaleString(),
      subtitle: "Distinct browsing sessions detected",
      icon: <Activity className="h-6 w-6 text-white" />,
      color: "bg-green-500",
      trend: formatDuration(avgSessionDuration)
    },
    {
      title: "Digital Explorer",
      value: uniqueDomains,
      subtitle: "Different websites discovered",
      icon: <Globe className="h-6 w-6 text-white" />,
      color: "bg-purple-500",
      trend: "Unique domains"
    },
    {
      title: "Marathon Session",
      value: formatDuration(longestSession),
      subtitle: "Your longest browsing session",
      icon: <Timer className="h-6 w-6 text-white" />,
      color: "bg-orange-500",
      trend: "Personal record"
    },
    {
      title: "Peak Activity Hour",
      value: `${mostActiveHour.hour}:00`,
      subtitle: `${mostActiveHour.visits} visits during this hour`,
      icon: <Zap className="h-6 w-6 text-white" />,
      color: "bg-yellow-500",
      trend: "Most active"
    },
    {
      title: "Favorite Day",
      value: mostActiveDay.day,
      subtitle: `${mostActiveDay.visits} visits on ${mostActiveDay.day}s`,
      icon: <Calendar className="h-6 w-6 text-white" />,
      color: "bg-indigo-500",
      trend: "Weekly pattern"
    },
    {
      title: "Pages Per Session",
      value: avgPagesPerSession,
      subtitle: "Average pages visited per session",
      icon: <Target className="h-6 w-6 text-white" />,
      color: "bg-teal-500",
      trend: "Efficiency"
    },
    {
      title: "Total Browse Time",
      value: formatDuration(totalBrowsingTime),
      subtitle: "Cumulative time across all sessions",
      icon: <Clock className="h-6 w-6 text-white" />,
      color: "bg-pink-500",
      trend: "Lifetime"
    },
    {
      title: nightOwlScore > workHoursScore ? "Night Owl" : "Day Worker",
      value: nightOwlScore > workHoursScore ? "🦉" : "☀️",
      subtitle: nightOwlScore > workHoursScore 
        ? `${nightOwlScore} late night visits` 
        : `${workHoursScore} work hours visits`,
      icon: <Eye className="h-6 w-6 text-white" />,
      color: nightOwlScore > workHoursScore ? "bg-slate-600" : "bg-amber-500",
      trend: "Browsing style"
    },
    {
      title: "Site Loyalty",
      value: `${Math.round((topDomain?.visitCount || 0) / totalVisits * 100)}%`,
      subtitle: `Of visits go to your top site`,
      icon: <Award className="h-6 w-6 text-white" />,
      color: "bg-emerald-500",
      trend: "Concentration"
    },
    {
      title: "Web Diversity",
      value: mostTypedSite.url.includes('://') 
        ? new URL(mostTypedSite.url).hostname.replace('www.', '') 
        : mostTypedSite.title.slice(0, 20),
      subtitle: `${mostTypedSite.typedCount} times typed directly`,
      icon: <Sparkles className="h-6 w-6 text-white" />,
      color: "bg-violet-500",
      trend: "Typed directly"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your Browsing Insights</h2>
        <p className="text-muted-foreground">
          Discover fascinating patterns and facts about your web browsing habits
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tiles" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
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

        <TabsContent value="tiles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {insightTiles.map((tile, index) => (
              <InsightTile
                key={index}
                {...tile}
                onClick={() => setSelectedInsight(tile.title)}
              />
            ))}
          </div>

          {/* Featured Insights Section */}
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-bold text-center">Featured Insights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Browsing Champion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Most Visited Site:</span>
                      <Badge variant="secondary">{topDomain?.domain}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Visit Count:</span>
                      <span className="font-bold">{topDomain?.visitCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Unique Pages:</span>
                      <span className="font-bold">{topDomain?.urls.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Typed Count:</span>
                      <span className="font-bold">{topDomain?.typedCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((topDomain?.visitCount || 0) / totalVisits * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This represents {Math.round((topDomain?.visitCount || 0) / totalVisits * 100)}% of your total visits
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Activity Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Peak Hour:</span>
                      <Badge variant="secondary">{mostActiveHour.hour}:00</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Peak Day:</span>
                      <Badge variant="secondary">{mostActiveDay.day}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Browsing Style:</span>
                      <Badge variant={nightOwlScore > workHoursScore ? "outline" : "default"}>
                        {nightOwlScore > workHoursScore ? "Night Owl 🦉" : "Day Worker ☀️"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-4">
                      {analytics.weeklyPattern.map((day, index) => (
                        <div key={day.day} className="text-center">
                          <div 
                            className={`h-8 rounded ${
                              day.visits > 100 ? 'bg-green-500' :
                              day.visits > 50 ? 'bg-green-400' :
                              day.visits > 20 ? 'bg-green-300' : 'bg-green-200'
                            }`}
                            title={`${day.day}: ${day.visits} visits`}
                          />
                          <span className="text-xs">{day.day.slice(0, 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

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
                {analytics.topDomains.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No domain data available</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart data={analytics.topDomains.slice(0, 8)}>
                    <Pie
                      data={analytics.topDomains.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ domain, percent }) => `${domain} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="visitCount"
                    >
                      {analytics.topDomains.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, 'Visits']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Domains Details</CardTitle>
                <CardDescription>Detailed statistics for most visited domains</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topDomains.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No domain data to display</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Make sure your data contains valid URLs with domains
                    </p>
                  </div>
                ) : (
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
                          {domain.urls.length} pages • {domain.typedCount} typed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                )}
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
                    (() => {
                      // Create meaningful duration buckets
                      const buckets = [
                        { label: '0-1 min', min: 0, max: 1, count: 0 },
                        { label: '1-5 min', min: 1, max: 5, count: 0 },
                        { label: '5-15 min', min: 5, max: 15, count: 0 },
                        { label: '15-30 min', min: 15, max: 30, count: 0 },
                        { label: '30-60 min', min: 30, max: 60, count: 0 },
                        { label: '1-2 hours', min: 60, max: 120, count: 0 },
                        { label: '2-4 hours', min: 120, max: 240, count: 0 },
                        { label: '4+ hours', min: 240, max: Infinity, count: 0 }
                      ]
                      
                      analytics.sessions.forEach(session => {
                        const durationMinutes = session.duration / (1000 * 60)
                        const bucket = buckets.find(b => durationMinutes >= b.min && durationMinutes < b.max)
                        if (bucket) {
                          bucket.count++
                        }
                      })
                      
                      return buckets.filter(b => b.count > 0)
                    })()
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Sessions']}
                      labelFormatter={(label) => `Duration: ${label}`}
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
                      <div className="text-2xl font-bold">{avgPagesPerSession}</div>
                      <div className="text-sm text-muted-foreground">Avg Pages/Session</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {formatDuration(longestSession)}
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