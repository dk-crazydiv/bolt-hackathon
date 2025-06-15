import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'

export const ChartView: React.FC = () => {
  const { currentFile } = useDataStore()

  if (!currentFile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No file selected</CardTitle>
              <CardDescription>Please upload a file first to view charts and visualizations.</CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Visualizations</h2>
        <p className="text-muted-foreground mb-4">
          Interactive charts and graphs will be available here soon.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">
            {currentFile.metadata.totalRecords.toLocaleString()} records
          </Badge>
          <Badge variant="secondary">
            {currentFile.type.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charts Coming Soon</CardTitle>
          <CardDescription>
            We're working on powerful visualization tools for your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Chart functionality will be implemented in the next update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}