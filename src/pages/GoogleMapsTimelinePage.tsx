import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { GoogleMapsTimelineCharts } from '@/components/charts/GoogleMapsTimelineCharts'

export const GoogleMapsTimelinePage: React.FC = () => {
  return (
    <PageLayout
      pageId="googleMapsTimeline"
      title="Google Maps Timeline"
      description="Analyze your Google Maps location history and timeline data to understand your movement patterns and frequently visited places."
      acceptedFormats={['.json', '.zip', '.html']}
      examples={[
        'Location History.json from Google Takeout',
        'Timeline data with coordinates and timestamps',
        'Places visited with duration and frequency',
        'Travel patterns and routes'
      ]}
    >
      <GoogleMapsTimelineCharts />
    </PageLayout>
  )
}