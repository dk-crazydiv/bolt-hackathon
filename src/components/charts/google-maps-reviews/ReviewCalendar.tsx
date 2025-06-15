import React from 'react'

interface ReviewCalendarProps {
  data: any[]
}

export const ReviewCalendar: React.FC<ReviewCalendarProps> = ({ data }) => {
  console.log('📅 ReviewCalendar: Processing data for simple calendar', { dataLength: data?.length })

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="text-center">
          <p>No review data available for calendar visualization</p>
        </div>
      </div>
    )
  }

  // Extract features from nested structure if needed
  let features = data
  if (data[0]?.features) {
    features = data[0].features
    console.log('📅 ReviewCalendar: Extracted features from nested structure', { featuresLength: features.length })
  }

  // Process data to count reviews by date
  const reviewsByDate: { [key: string]: { count: number; places: string[] } } = {}
  
  features.forEach((feature: any) => {
    const properties = feature.properties || feature
    
    // Extract date
    let reviewDate: Date | null = null
    if (properties.Published) {
      reviewDate = new Date(properties.Published)
    } else if (properties.publishedAtDate) {
      reviewDate = new Date(properties.publishedAtDate)
    }

    if (!reviewDate || isNaN(reviewDate.getTime())) {
      return
    }

    const dateKey = reviewDate.toISOString().split('T')[0]
    
    // Extract place name
    const placeName = properties.gmap_info?.title || 
                     properties.title || 
                     properties.name || 
                     'Unknown Place'

    if (!reviewsByDate[dateKey]) {
      reviewsByDate[dateKey] = { count: 0, places: [] }
    }
    
    reviewsByDate[dateKey].count += 1
    reviewsByDate[dateKey].places.push(placeName)
  })

  const sortedDates = Object.keys(reviewsByDate).sort()
  const totalReviews = Object.values(reviewsByDate).reduce((sum, day) => sum + day.count, 0)

  if (sortedDates.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="text-center">
          <p>No valid dates found in review data</p>
        </div>
      </div>
    )
  }

  const firstDate = new Date(sortedDates[0])
  const lastDate = new Date(sortedDates[sortedDates.length - 1])

  return (
    <div className="w-full space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-2xl font-bold">{totalReviews}</div>
          <div className="text-sm text-muted-foreground">Total Reviews</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-2xl font-bold">{sortedDates.length}</div>
          <div className="text-sm text-muted-foreground">Active Days</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-2xl font-bold">{Math.round(totalReviews / sortedDates.length * 10) / 10}</div>
          <div className="text-sm text-muted-foreground">Avg per Day</div>
        </div>
      </div>

      {/* Date Range */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Review period: {firstDate.toLocaleDateString()} - {lastDate.toLocaleDateString()}</p>
      </div>

      {/* Recent Activity List */}
      <div className="space-y-2">
        <h4 className="font-semibold">Recent Review Activity</h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {sortedDates.slice(-10).reverse().map(date => {
            const dayData = reviewsByDate[date]
            const dateObj = new Date(date)
            return (
              <div key={date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium">{dateObj.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</div>
                  <div className="text-sm text-muted-foreground">
                    {dayData.count} review{dayData.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right max-w-xs">
                  <div className="text-sm text-muted-foreground truncate">
                    {dayData.places.slice(0, 2).join(', ')}
                    {dayData.places.length > 2 && ` +${dayData.places.length - 2} more`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="space-y-2">
        <h4 className="font-semibold">Monthly Activity</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(() => {
            const monthlyData: { [key: string]: number } = {}
            sortedDates.forEach(date => {
              const monthKey = date.substring(0, 7) // YYYY-MM
              monthlyData[monthKey] = (monthlyData[monthKey] || 0) + reviewsByDate[date].count
            })
            
            return Object.entries(monthlyData).sort().map(([month, count]) => {
              const [year, monthNum] = month.split('-')
              const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              
              return (
                <div key={month} className="bg-muted/30 rounded p-2 text-center">
                  <div className="font-medium">{count}</div>
                  <div className="text-xs text-muted-foreground">{monthName}</div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
} 