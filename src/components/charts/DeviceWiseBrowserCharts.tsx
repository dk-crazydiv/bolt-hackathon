import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'

const DEVICE_COLORS = {
  mobile: '#ef4444',
  tablet: '#f97316', 
  laptop: '#3b82f6'
}

// Mock data - replace with actual data
const crossDevicePatterns = {
  timeBasedUsage: [
    { hour: '00:00', mobile: 10, tablet: 5, laptop: 2 },
    { hour: '01:00', mobile: 8, tablet: 3, laptop: 1 },
    { hour: '02:00', mobile: 5, tablet: 2, laptop: 1 },
    { hour: '03:00', mobile: 3, tablet: 1, laptop: 0 },
    { hour: '04:00', mobile: 2, tablet: 1, laptop: 0 },
    { hour: '05:00', mobile: 4, tablet: 2, laptop: 1 },
    { hour: '06:00', mobile: 15, tablet: 8, laptop: 5 },
    { hour: '07:00', mobile: 25, tablet: 12, laptop: 15 },
    { hour: '08:00', mobile: 30, tablet: 15, laptop: 25 },
    { hour: '09:00', mobile: 35, tablet: 20, laptop: 40 },
    { hour: '10:00', mobile: 40, tablet: 25, laptop: 45 },
    { hour: '11:00', mobile: 45, tablet: 30, laptop: 50 },
    { hour: '12:00', mobile: 50, tablet: 35, laptop: 45 },
    { hour: '13:00', mobile: 48, tablet: 32, laptop: 42 },
    { hour: '14:00', mobile: 52, tablet: 38, laptop: 48 },
    { hour: '15:00', mobile: 55, tablet: 40, laptop: 52 },
    { hour: '16:00', mobile: 58, tablet: 42, laptop: 55 },
    { hour: '17:00', mobile: 60, tablet: 45, laptop: 50 },
    { hour: '18:00', mobile: 65, tablet: 48, laptop: 45 },
    { hour: '19:00', mobile: 70, tablet: 50, laptop: 40 },
    { hour: '20:00', mobile: 75, tablet: 52, laptop: 35 },
    { hour: '21:00', mobile: 72, tablet: 48, laptop: 30 },
    { hour: '22:00', mobile: 68, tablet: 45, laptop: 25 },
    { hour: '23:00', mobile: 45, tablet: 25, laptop: 15 }
  ]
}

const mockVisitsData = [
  { date: '2024-01-01', visits: 120 },
  { date: '2024-01-02', visits: 135 },
  { date: '2024-01-03', visits: 98 },
  { date: '2024-01-04', visits: 156 },
  { date: '2024-01-05', visits: 142 }
]

export default function DeviceWiseBrowserCharts() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Browser Visits Over Time</CardTitle>
              <CardDescription>Daily visit patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockVisitsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🕒 24-Hour Activity Pattern</CardTitle>
              <CardDescription>Hourly usage across device types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crossDevicePatterns.timeBasedUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mobile"
                    stroke={DEVICE_COLORS.mobile}
                    strokeWidth={2}
                    name="Mobile"
                  />
                  <Line
                    type="monotone"
                    dataKey="tablet"
                    stroke={DEVICE_COLORS.tablet}
                    strokeWidth={2}
                    name="Tablet"
                  />
                  <Line
                    type="monotone"
                    dataKey="laptop"
                    stroke={DEVICE_COLORS.laptop}
                    strokeWidth={2}
                    name="Laptop"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { DeviceWiseBrowserCharts }