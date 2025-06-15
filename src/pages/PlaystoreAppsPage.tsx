import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { PlaystoreAppsCharts } from '@/components/charts/PlaystoreAppsCharts'

export const PlaystoreAppsPage: React.FC = () => {
  return (
    <PageLayout
      pageId="playstoreAppsData"
      title="Play Store App Installs"
      description="Explore your Google Play Store app installation history and usage patterns."
      acceptedFormats={['.json', '.html']}
      examples={[
        'Play Store install history from Google Takeout',
        'App purchase history',
        'Installation dates and app categories',
        'App usage and update patterns'
      ]}
    >
      <PlaystoreAppsCharts />
    </PageLayout>
  )
}