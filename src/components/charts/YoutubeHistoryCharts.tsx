import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, TrendingUp } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'

export const YoutubeHistoryCharts: React.FC = () => {
  const { getPageData } = useDataStore()
  const data = getPageData('youtubeHistory')

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No data uploaded</CardTitle>
            <CardDescription>Upload your YouTube history data to see visualizations.</CardDescription>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metadata.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Video records</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Size</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.size / 1024 / 1024).toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">Data processed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Type</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.type.toUpperCase()}</div>
            <p className="text-xs text-muted-foreground">Format detected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>YouTube History Analysis</CardTitle>
          <CardDescription>
            Advanced charts and visualizations for your YouTube data will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              YouTube analysis features coming soon:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">Watch time analysis</Badge>
              <Badge variant="outline">Favorite channels</Badge>
              <Badge variant="outline">Content categories</Badge>
              <Badge variant="outline">Viewing patterns</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}