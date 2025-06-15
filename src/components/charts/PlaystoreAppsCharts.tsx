import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Smartphone,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Download,
  Zap,
  Gift,
  Settings,
  Trophy,
  Activity
} from 'lucide-react'
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
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { useDataStore } from '@/store/dataStore'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

interface PlayStoreData {
  installs: any[]
  devices: any[]
  library: any[]
  orderHistory: any[]
  purchaseHistory: any[]
  playSettings: any[]
}

export const PlaystoreAppsCharts: React.FC = () => {
  const { getPageData } = useDataStore()
  const data = getPageData('playstoreAppsData')
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const processedData = useMemo(() => {
    if (!data?.data) return null

    const getData = (filename: string) => {
      const key = Object.keys(data.data).find(k => k.endsWith(filename))
      return key ? data.data[key] : []
    }

    const installs = getData('Installs.json')
    const devices = getData('Devices.json')
    const library = getData('Library.json')
    const orderHistory = getData('Order History.json')
    const purchaseHistory = getData('Purchase History.json')
    const playSettings = getData('Play Settings.json')

    // Process installs data
    const installsData = installs.map((item: any) => ({
      title: item.install?.doc?.title || 'Unknown App',
      firstInstall: new Date(item.install?.firstInstallationTime || 0),
      lastUpdate: new Date(item.install?.lastUpdateTime || 0),
      device: item.install?.deviceAttribute?.deviceDisplayName || 'Unknown Device',
      manufacturer: item.install?.deviceAttribute?.manufacturer || 'Unknown',
      model: item.install?.deviceAttribute?.model || 'Unknown'
    }))

    // Process devices data
    const devicesData = devices.map((item: any) => ({
      manufacturer: item.device?.mostRecentData?.manufacturer || 'Unknown',
      model: item.device?.mostRecentData?.modelName || 'Unknown',
      androidVersion: item.device?.mostRecentData?.androidSdkVersion || 'Unknown',
      totalMemory: parseInt(item.device?.mostRecentData?.totalMemoryBytes || '0'),
      registrationTime: new Date(item.device?.deviceRegistrationTime || 0),
      lastActive: new Date(item.device?.lastTimeDeviceActive || 0),
      carrier: item.device?.mostRecentData?.carrierName || 'Unknown'
    }))

    // Process library data
    const libraryData = library.map((item: any) => ({
      title: item.libraryDoc?.doc?.title || 'Unknown',
      type: item.libraryDoc?.doc?.documentType || 'Unknown',
      acquisitionTime: new Date(item.libraryDoc?.acquisitionTime || 0)
    }))

    // Process order history
    const ordersData = orderHistory.map((item: any) => ({
      orderId: item.orderHistory?.orderId || '',
      creationTime: new Date(item.orderHistory?.creationTime || 0),
      totalPrice: item.orderHistory?.totalPrice || '₹0.00',
      items: item.orderHistory?.lineItem || [],
      isRenewal: item.orderHistory?.renewalOrder || false
    }))

    return {
      installs: installsData,
      devices: devicesData,
      library: libraryData,
      orders: ordersData
    }
  }, [data])

  console.log(processedData, data)

  const kpiData = useMemo(() => {
    if (!processedData) return null

    const totalApps = processedData.installs.length
    const totalSpend = processedData.orders.reduce((sum, order) => {
      const price = parseFloat(order.totalPrice.replace(/[₹,]/g, '')) || 0
      return sum + price
    }, 0)

    const installsByYear = processedData.installs.reduce((acc: any, install) => {
      const year = install.firstInstall.getFullYear()
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {})

    const mostInstalledYear = Object.entries(installsByYear).reduce((max: any, [year, count]: any) =>
      count > max.count ? { year, count } : max, { year: 0, count: 0 }
    )

    // Fix: Add guard for empty array and provide initial value
    const oldestApp = processedData.installs.length > 0
      ? processedData.installs.reduce((oldest, app) =>
        app.firstInstall < oldest.firstInstall ? app : oldest
      )
      : { title: 'N/A' }

    const uniqueDevices = new Set(processedData.devices.map(d => `${d.manufacturer} ${d.model}`)).size

    return {
      totalApps,
      totalSpend,
      mostInstalledYear: mostInstalledYear.year,
      longestRetainedApp: oldestApp?.title || 'N/A',
      uniqueDevices
    }
  }, [processedData])

  const installActivityData = useMemo(() => {
    if (!processedData) return []

    const monthlyData = processedData.installs.reduce((acc: any, install) => {
      const monthKey = `${install.firstInstall.getFullYear()}-${String(install.firstInstall.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, installs: 0, updates: 0 }
      }

      acc[monthKey].installs += 1

      // Count updates (when lastUpdate is significantly after firstInstall)
      const daysDiff = (install.lastUpdate.getTime() - install.firstInstall.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 30) {
        acc[monthKey].updates += 1
      }

      return acc
    }, {})

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month))
  }, [processedData])

  const spendingData = useMemo(() => {
    if (!processedData) return { categorySpending: [], cumulativeSpending: [] }

    const categorySpending = processedData.orders.reduce((acc: any, order) => {
      const price = parseFloat(order.totalPrice.replace(/[₹,]/g, '')) || 0
      const category = order.items[0]?.doc?.documentType || 'Other'

      const existing = acc.find((item: any) => item.category === category)
      if (existing) {
        existing.amount += price
      } else {
        acc.push({ category, amount: price })
      }

      return acc
    }, [])

    const cumulativeSpending = processedData.orders
      .sort((a, b) => a.creationTime.getTime() - b.creationTime.getTime())
      .reduce((acc: any, order, index) => {
        const price = parseFloat(order.totalPrice.replace(/[₹,]/g, '')) || 0
        const prevTotal = index > 0 ? acc[index - 1].total : 0

        acc.push({
          date: order.creationTime.toISOString().split('T')[0],
          total: prevTotal + price
        })

        return acc
      }, [])

    return { categorySpending, cumulativeSpending }
  }, [processedData])

  const libraryBreakdown = useMemo(() => {
    if (!processedData) return []

    return processedData.library.reduce((acc: any, item) => {
      const existing = acc.find((cat: any) => cat.type === item.type)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ type: item.type, count: 1 })
      }
      return acc
    }, [])
  }, [processedData])

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No data uploaded</CardTitle>
            <CardDescription>Upload your Play Store app data to see visualizations.</CardDescription>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!processedData || !kpiData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CardTitle className="mb-2">Processing data...</CardTitle>
            <CardDescription>Please wait while we analyze your Play Store data.</CardDescription>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📱 Total Apps</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalApps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Apps installed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💰 Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpiData.totalSpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📅 Peak Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.mostInstalledYear}</div>
            <p className="text-xs text-muted-foreground">Most installs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏆 Longest App</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={kpiData.longestRetainedApp}>
              {kpiData.longestRetainedApp}
            </div>
            <p className="text-xs text-muted-foreground">Still installed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📱 Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.uniqueDevices}</div>
            <p className="text-xs text-muted-foreground">Unique devices</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="activity">📊 Activity</TabsTrigger>
          <TabsTrigger value="spending">💸 Spending</TabsTrigger>
          <TabsTrigger value="library">📚 Library</TabsTrigger>
          <TabsTrigger value="devices">📱 Devices</TabsTrigger>
          <TabsTrigger value="insights">🏅 Insights</TabsTrigger>
          <TabsTrigger value="timeline">📅 Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Install & Update Activity</CardTitle>
              <CardDescription>App installation and update patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={installActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="installs"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="New Installs"
                  />
                  <Area
                    type="monotone"
                    dataKey="updates"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Updates"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🔄 Recent Updates</CardTitle>
                <CardDescription>Recently updated applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {processedData.installs
                    .sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime())
                    .slice(0, 10)
                    .map((app, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{app.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.lastUpdate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {app.device.split(' ')[0]}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 App Categories</CardTitle>
                <CardDescription>Distribution of installed apps by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Google', 'Social', 'Finance', 'Shopping', 'Entertainment', 'Productivity']
                    .map(category => {
                      const count = processedData.installs.filter(app =>
                        app.title.toLowerCase().includes(category.toLowerCase())
                      ).length
                      const percentage = processedData.installs.length > 0 ? (count / processedData.installs.length) * 100 : 0

                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>💰 Spending by Category</CardTitle>
                <CardDescription>Breakdown of purchases by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendingData.categorySpending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, amount }) => `${category}: ₹${amount.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {spendingData.categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📈 Cumulative Spending</CardTitle>
                <CardDescription>Total spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={spendingData.cumulativeSpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Total Spent']} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Subscription Analysis</CardTitle>
              <CardDescription>Active vs canceled subscriptions and spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {processedData.orders.filter(o => o.items.some((item: any) =>
                      item.doc?.documentType === 'Subscription'
                    )).length}
                  </div>
                  <p className="text-sm text-green-600">Total Subscriptions</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{processedData.orders
                      .filter(o => o.items.some((item: any) => item.doc?.documentType === 'Subscription'))
                      .reduce((sum, order) => sum + parseFloat(order.totalPrice.replace(/[₹,]/g, '') || '0'), 0)
                      .toFixed(2)}
                  </div>
                  <p className="text-sm text-blue-600">Subscription Spend</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {processedData.orders.filter(o => o.isRenewal).length}
                  </div>
                  <p className="text-sm text-orange-600">Renewals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📚 Library Breakdown</CardTitle>
                <CardDescription>Content types in your library</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={libraryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {libraryBreakdown.map((entry, index) => (
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
                <CardTitle>📖 Recent Acquisitions</CardTitle>
                <CardDescription>Recently added content to your library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {processedData.library
                    .sort((a, b) => b.acquisitionTime.getTime() - a.acquisitionTime.getTime())
                    .slice(0, 8)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.acquisitionTime.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedData.devices.map((device, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {device.manufacturer} {device.model}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Android</p>
                      <p className="font-medium">API {device.androidVersion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">RAM</p>
                      <p className="font-medium">{(device.totalMemory / (1024 ** 3)).toFixed(1)}GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">{device.carrier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Active</p>
                      <p className="font-medium">{device.lastActive.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Registered: {device.registrationTime.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Fun Facts & Highlights</CardTitle>
                <CardDescription>Interesting insights from your Play Store data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">📱 Oldest App Still Installed</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{kpiData.longestRetainedApp}</p>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">🚀 Peak Install Day</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {(() => {
                      if (processedData.installs.length === 0) return 'N/A'
                      const installsByDate = processedData.installs.reduce((acc: any, install) => {
                        const date = install.firstInstall.toDateString()
                        acc[date] = (acc[date] || 0) + 1
                        return acc
                      }, {})
                      const peakDay = Object.entries(installsByDate).reduce((max: any, [date, count]: any) =>
                        count > max.count ? { date, count } : max, { date: 'N/A', count: 0 }
                      )
                      return peakDay.date
                    })()}
                  </p>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">🔄 Most Updated App</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {(() => {
                      const updatedApps = processedData.installs
                        .filter(app => (app.lastUpdate.getTime() - app.firstInstall.getTime()) > 0)
                      if (updatedApps.length === 0) return 'N/A'
                      return updatedApps
                        .sort((a, b) => (b.lastUpdate.getTime() - b.firstInstall.getTime()) - (a.lastUpdate.getTime() - a.firstInstall.getTime()))[0]?.title || 'N/A'
                    })()}
                  </p>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">💰 Biggest Single Purchase</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    ₹{processedData.orders.length > 0
                      ? Math.max(...processedData.orders.map(o => parseFloat(o.totalPrice.replace(/[₹,]/g, '') || '0'))).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Usage Patterns</CardTitle>
                <CardDescription>Your app usage and behavior patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Google Apps</span>
                    <span className="text-sm font-medium">
                      {processedData.installs.filter(app => app.title.toLowerCase().includes('google')).length} apps
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Media</span>
                    <span className="text-sm font-medium">
                      {processedData.installs.filter(app =>
                        ['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin', 'telegram'].some(social =>
                          app.title.toLowerCase().includes(social)
                        )
                      ).length} apps
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Finance Apps</span>
                    <span className="text-sm font-medium">
                      {processedData.installs.filter(app =>
                        ['bank', 'pay', 'wallet', 'finance', 'money', 'trading'].some(finance =>
                          app.title.toLowerCase().includes(finance)
                        )
                      ).length} apps
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Entertainment</span>
                    <span className="text-sm font-medium">
                      {processedData.installs.filter(app =>
                        ['netflix', 'youtube', 'spotify', 'music', 'video', 'game'].some(entertainment =>
                          app.title.toLowerCase().includes(entertainment)
                        )
                      ).length} apps
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 Installation Timeline</CardTitle>
              <CardDescription>Your app installation journey over the years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  processedData.installs.reduce((acc: any, install) => {
                    const year = install.firstInstall.getFullYear()
                    if (!acc[year]) acc[year] = []
                    acc[year].push(install)
                    return acc
                  }, {})
                )
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .slice(0, 5)
                  .map(([year, apps]: [string, any]) => (
                    <div key={year} className="border-l-2 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{year}</Badge>
                        <span className="text-sm text-muted-foreground">{apps.length} apps installed</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {apps.slice(0, 6).map((app: any, index: number) => (
                          <div key={index} className="text-xs p-2 bg-muted rounded">
                            <p className="font-medium truncate">{app.title}</p>
                            <p className="text-muted-foreground">{app.firstInstall.toLocaleDateString()}</p>
                          </div>
                        ))}
                        {apps.length > 6 && (
                          <div className="text-xs p-2 bg-muted rounded flex items-center justify-center">
                            <span className="text-muted-foreground">+{apps.length - 6} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}