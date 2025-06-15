import React from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropZone } from '@/components/DropZone'
import { JsonDebugView } from '@/components/JsonDebugView/JsonDebugView'
import { ChartView } from '@/components/Charts/ChartView'
import { useDataStore } from '@/store/dataStore'

const dataTypeInfo = {
  'google-takeout': {
    title: 'Google Takeout',
    description: 'Explore your Google data exports including Gmail, Photos, YouTube, and more.',
    acceptedFormats: ['.zip', '.json'],
    examples: ['Google Photos metadata', 'Gmail messages', 'YouTube history', 'Location data']
  },
  'generic-json': {
    title: 'Generic JSON',
    description: 'Upload and explore any JSON file with our powerful debugging and visualization tools.',
    acceptedFormats: ['.json'],
    examples: ['API responses', 'Configuration files', 'Database exports', 'Log files']
  },
  'social-media': {
    title: 'Social Media Data',
    description: 'Analyze your social media data exports from various platforms.',
    acceptedFormats: ['.json', '.zip'],
    examples: ['Twitter archive', 'Facebook data', 'Instagram export', 'LinkedIn data']
  },
  'analytics': {
    title: 'Analytics Data',
    description: 'Visualize and explore analytics data from various sources.',
    acceptedFormats: ['.json', '.csv'],
    examples: ['Google Analytics', 'Website metrics', 'User behavior data', 'Performance metrics']
  }
}

export const DataTypePage: React.FC = () => {
  const { dataType } = useParams<{ dataType: string }>()
  const { currentFile } = useDataStore()
  
  const info = dataType ? dataTypeInfo[dataType as keyof typeof dataTypeInfo] : null

  if (!info) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Data Type Not Found</h1>
          <p className="text-muted-foreground">The requested data type does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{info.title}</h1>
        <p className="text-muted-foreground text-lg mb-4">{info.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Accepted Formats</h3>
            <div className="flex flex-wrap gap-2">
              {info.acceptedFormats.map((format) => (
                <span key={format} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                  {format}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Examples</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {info.examples.map((example, index) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="debug" disabled={!currentFile}>Debug JSON</TabsTrigger>
          <TabsTrigger value="charts" disabled={!currentFile}>Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <DropZone />
        </TabsContent>
        
        <TabsContent value="debug" className="mt-6">
          <JsonDebugView />
        </TabsContent>
        
        <TabsContent value="charts" className="mt-6">
          <ChartView />
        </TabsContent>
      </Tabs>
    </div>
  )
}