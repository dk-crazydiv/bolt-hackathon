import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Smartphone,
  Tablet,
  Laptop,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { DeviceAnalyzer } from '../../utils/deviceAnalyzer'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
const DEVICE_COLORS = {
  mobile: '#ef4444',
  tablet: '#f59e0b', 
  laptop: '#3b82f6',
  unknown: '#6b7280'
}

interface DeviceWiseBrowserChartsProps {
  deviceData: any
  browserData: any
}

export const DeviceWiseBrowserCharts: React.FC<DeviceWiseBrowserChartsProps> = ({
  deviceData,
  browserData
}) => {
  const [selectedDeviceType, setSelectedDeviceType] = useState<'all' | 'mobile' | 'tablet' | 'laptop'>('all')

  const analysis = useMemo(() => {
    if (!deviceData || !browserData) return null
    
    console.log('🔍 DeviceWiseBrowserCharts: Processing data...')
    console.log('Device data:', deviceData)
    console.log('Browser data:', browserData)
    
    const analyzer = new DeviceAnalyzer(deviceData, browserData)
    return analyzer.analyzeDeviceUsage()
  }, [deviceData, browserData])

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No device data available</CardTitle>
            <CardDescription>
              Upload device information file to see device-wise analysis.
              {!deviceData && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-yellow-700 dark:text-yellow-300 text-sm">
                  Device data: {deviceData ? 'Available' : 'Missing'}
                  <br />
                  Browser data: {browserData ? 'Available' : 'Missing'}
                </div>
              )}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { deviceStats, deviceComparison, crossDevicePatterns } = analysis

  const filteredDeviceStats = selectedDeviceType === 'all' 
    ? deviceStats 
    : deviceStats.filter(d => d.deviceType === selectedDeviceType)

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'laptop': return <Laptop className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const totalDevices = deviceStats.length
  const totalVisits = deviceStats.reduce((sum, d) => sum + d.totalVisits, 0)
  const mostActiveDevice = deviceStats.reduce((max, d) => d.totalVisits > max.totalVisits ? d : max, deviceStats[0])

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📱 Total Devices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">Unique devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🌐 Total Visits</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏆 Most Active</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={mostActiveDevice?.deviceName}>
              {mostActiveDevice?.deviceName || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostActiveDevice?.totalVisits.toLocaleString()} visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📊 Avg/Device</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDevices > 0 ? Math.round(totalVisits / totalDevices).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Visits per device</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by device type:</span>
        <div className="flex gap-2">
          {(['all', 'mobile', 'tablet', 'laptop'] as const).map(type => (
            <Button
              key={type}
              variant={selectedDeviceType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDeviceType(type)}
              className="flex items-center gap-2"
            >
              {type !== 'all' && getDeviceIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="devices">📱 Devices</TabsTrigger>
          <TabsTrigger value="comparison">⚖️ Comparison</TabsTrigger>
          <TabsTrigger value="patterns">🔄 Patterns</TabsTrigger>
          <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📱 Device Type Distribution</CardTitle>
                <CardDescription>Breakdown of devices by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceComparison}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ deviceType, totalDevices }) => `${deviceType}: ${totalDevices}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalDevices"
                    >
                      {deviceComparison.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.deviceType]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🕐 Cross-Device Usage by Hour</CardTitle>
                <CardDescription>Usage patterns across device types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={crossDevicePatterns.timeBasedUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="mobile"
                      stackId="1"
                      stroke={DEVICE_COLORS.mobile}
                      fill={DEVICE_COLORS.mobile}
                      fillOpacity={0.6}
                      name="Mobile"
                    />
                    <Area
                      type="monotone"
                      dataKey="tablet"
                      stackId="1"
                      stroke={DEVICE_COLORS.tablet}
                      fill={DEVICE_COLORS.tablet}
                      fillOpacity={0.6}
                      name="Tablet"
                    />
                    <Area
                      type="monotone"
                      dataKey="laptop"
                      stackId="1"
                      stroke={DEVICE_COLORS.laptop}
                      fill={DEVICE_COLORS.laptop}
                      fillOpacity={0.6}
                      name="Laptop"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🔗 Shared Sites Across Devices</CardTitle>
              <CardDescription>Websites accessed from multiple devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {crossDevicePatterns.sharedSites.slice(0, 10).map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{site.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Used on {site.devices.length} devices
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline">
                        {site.totalVisits} visits
                      </Badge>
                      <Badge variant="secondary">
                        {site.devices.length} devices
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeviceStats.map((device, index) => (
              <Card key={device.device_guid}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getDeviceIcon(device.deviceType)}
                    <span className="truncate">{device.deviceName}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{device.deviceType}</Badge>
                    <Badge variant="secondary">{device.manufacturer}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Visits</p>
                      <p className="font-medium">{device.totalVisits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unique URLs</p>
                      <p className="font-medium">{device.uniqueUrls.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Peak Hour</p>
                      <p className="font-medium">{device.peakUsageHour}:00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Top Site</p>
                      <p className="font-medium truncate" title={device.mostVisitedSite}>
                        {device.mostVisitedSite}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last active: {device.lastActive.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Visits by Device Type</CardTitle>
                <CardDescription>Total visits comparison across device types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deviceComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="deviceType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalVisits" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 Average Visits per Device</CardTitle>
                <CardDescription>Usage intensity by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deviceComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="deviceType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgVisitsPerDevice" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceComparison.map((comparison, index) => (
              <Card key={comparison.deviceType}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    {getDeviceIcon(comparison.deviceType)}
                    {comparison.deviceType.charAt(0).toUpperCase() + comparison.deviceType.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Devices</p>
                      <p className="font-medium">{comparison.totalDevices}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Visits</p>
                      <p className="font-medium">{comparison.totalVisits.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Peak Hours</p>
                    <div className="flex gap-1">
                      {comparison.usagePatterns.peakHours.map(hour => (
                        <Badge key={hour} variant="outline" className="text-xs">
                          {hour}:00
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Top Sites</p>
                    <div className="space-y-1">
                      {comparison.topSites.slice(0, 3).map((site, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="truncate block" title={site.url}>
                            {site.url}
                          </span>
                          <span className="text-muted-foreground">
                            {site.visits} visits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔄 Device Usage Patterns</CardTitle>
              <CardDescription>Insights into how different devices are used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">📱 Mobile Patterns</h4>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <ul className="text-sm space-y-1">
                      <li>• Peak usage during commute hours</li>
                      <li>• Higher weekend activity</li>
                      <li>• Shorter session durations</li>
                      <li>• Social media and news focused</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">💻 Laptop Patterns</h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <ul className="text-sm space-y-1">
                      <li>• Peak usage during work hours</li>
                      <li>• Higher weekday activity</li>
                      <li>• Longer session durations</li>
                      <li>• Work and productivity focused</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>⏰ Weekday vs Weekend Usage</CardTitle>
                <CardDescription>Device usage patterns by day type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceComparison.map(comparison => (
                    <div key={comparison.deviceType} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(comparison.deviceType)}
                        <span className="font-medium capitalize">{comparison.deviceType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Weekday</p>
                          <p className="font-medium">
                            {comparison.usagePatterns.weekdayVsWeekend.weekday.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Weekend</p>
                          <p className="font-medium">
                            {comparison.usagePatterns.weekdayVsWeekend.weekend.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Device Preferences</CardTitle>
                <CardDescription>What each device type is used for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="font-medium">Mobile</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quick browsing, social media, news, on-the-go searches
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Tablet className="h-4 w-4" />
                      <span className="font-medium">Tablet</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Media consumption, reading, casual browsing, entertainment
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Laptop className="h-4 w-4" />
                      <span className="font-medium">Laptop</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Work tasks, detailed research, content creation, long sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 Device Activity Timeline</CardTitle>
              <CardDescription>Daily activity across all devices</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deviceStats[0]?.dailyActivity.slice(-30) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🕐 Hourly Usage Distribution</CardTitle>
                <CardDescription>When each device type is most active</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={crossDevicePatterns.timeBasedUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mobile"
                      stroke={DEVICE_COLORS.mobile}
                      fill={DEVICE_COLORS.mobile}
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="laptop"
                      stroke={DEVICE_COLORS.laptop}
                      fill={DEVICE_COLORS.laptop}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Device Activity Summary</CardTitle>
                <CardDescription>Key metrics for each device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {deviceStats.slice(0, 5).map((device, index) => (
                    <div key={device.device_guid} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <p className="text-sm font-medium truncate" title={device.deviceName}>
                            {device.deviceName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device.manufacturer} {device.model}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{device.totalVisits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}