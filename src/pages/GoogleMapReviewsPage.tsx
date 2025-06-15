import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { GoogleMapReviewsCharts } from '@/components/charts/GoogleMapReviewsCharts'

export const GoogleMapReviewsPage: React.FC = () => {
  return (
    <PageLayout
      pageId="googleMapReviews"
      title="Google Map Reviews"
      description="Explore your Google Maps reviews, ratings, and contributions to local businesses and places."
      acceptedFormats={['.json', '.html']}
      examples={[
        'Maps reviews from Google Takeout',
        'Business ratings and comments',
        'Photos and contributions',
        'Review history and locations'
      ]}
    >
      <GoogleMapReviewsCharts />
    </PageLayout>
  )
}