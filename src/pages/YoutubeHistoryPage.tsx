import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { YoutubeHistoryCharts } from '@/components/charts/YoutubeHistoryCharts'

export const YoutubeHistoryPage: React.FC = () => {
  return (
    <PageLayout
      pageId="youtubeHistory"
      title="YouTube History"
      description="Analyze your YouTube viewing patterns, favorite channels, and content consumption habits."
      acceptedFormats={['.json', '.html']}
      examples={[
        'YouTube watch history from Google Takeout',
        'Search history and queries',
        'Liked videos and playlists',
        'Channel subscriptions and activity'
      ]}
    >
      <YoutubeHistoryCharts />
    </PageLayout>
  )
}