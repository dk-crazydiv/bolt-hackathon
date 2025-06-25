import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DeviceWiseBrowserCharts } from './DeviceWiseBrowserCharts';

interface BrowserHistoryChartsProps {
  data?: any;
  deviceData?: any;
  analytics?: any;
}

function BrowserHistoryCharts({ data, deviceData, analytics }: BrowserHistoryChartsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Device Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browser History Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Quick Stats
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Most visited domain: {analytics?.topDomains?.[0]?.domain || 'None'}</li>
                    <li>• Most typed site: {analytics?.totalStats?.mostTypedSite || 'None'}</li>
                    <li>• Unique sites visited: {analytics?.totalStats?.totalSites || 0}</li>
                    <li>• Different domains: {analytics?.totalStats?.totalDomains || 0}</li>
                  </ul>
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