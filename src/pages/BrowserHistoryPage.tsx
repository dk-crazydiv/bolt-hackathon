import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { BrowserHistoryCharts } from '@/components/charts/BrowserHistoryCharts'
import { DeviceInfoUpload } from '@/components/common/DeviceInfoUpload'

export const BrowserHistoryPage: React.FC = () => {
  return (
    <PageLayout
      pageId="browserHistory"
      title="Browser History"
      description="Explore your web browsing patterns, most visited sites, and browsing habits over time."
      acceptedFormats={['.json', '.html']}
      examples={[
        'Chrome history export',
        'Firefox browsing history',
        'Safari history data',
        'Edge browsing patterns'
      ]}
      additionalUpload={<DeviceInfoUpload />}
    >
      <BrowserHistoryCharts />
    </PageLayout>
  )
}