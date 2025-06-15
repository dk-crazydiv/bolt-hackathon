import React from 'react'
import { PageLayout } from '@/components/common/PageLayout'
import { FitbitDataCharts } from '@/components/charts/FitbitDataCharts'

export const FitbitDataPage: React.FC = () => {
  return (
    <PageLayout
      pageId="fitbitData"
      title="Fitbit Data"
      description="Analyze your fitness and health data including steps, heart rate, sleep patterns, and activity levels."
      acceptedFormats={['.json', '.zip']}
      examples={[
        'Daily activity and steps data',
        'Heart rate monitoring',
        'Sleep patterns and quality',
        'Exercise and workout sessions'
      ]}
    >
      <FitbitDataCharts />
    </PageLayout>
  )
}