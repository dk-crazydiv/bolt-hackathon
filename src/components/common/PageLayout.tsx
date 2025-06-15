import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bug, Trash2, Database, CheckCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DropZone } from '@/components/common/DropZone'
import { useDataStore } from '@/store/dataStore'
import { ParsedData } from '@/types'

interface PageLayoutProps {
  pageId: string
  title: string
  description: string
  acceptedFormats: string[]
  examples: string[]
  children: React.ReactNode
  additionalUpload?: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  pageId,
  title,
  description,
  acceptedFormats,
  examples,
  children,
  additionalUpload
}) => {
  const navigate = useNavigate()
  const { getPageData, clearPageData, loadPageDataFromDB } = useDataStore()
  const currentData = getPageData(pageId)

  // Load data from IndexedDB when component mounts
  useEffect(() => {
    const loadData = async () => {
      // If we have metadata but no actual data, load from IndexedDB
      if (currentData && !currentData.data && (currentData as any)._hasDataInIndexedDB) {
        await loadPageDataFromDB(pageId)
      }
    }
    
    loadData()
  }, [pageId, loadPageDataFromDB, currentData])

  const handleClearData = async () => {
    await clearPageData(pageId)
  }

  const handleDebugJson = () => {
    navigate('/debug-json', { state: { data: currentData } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground text-lg mb-4">{description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Accepted Formats</h3>
            <div className="flex flex-wrap gap-2">
              {acceptedFormats.map((format) => (
                <Badge key={format} variant="secondary">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Examples</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {examples.map((example, index) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>
        </div>

        {currentData && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="uploaded-file" className="border rounded-lg bg-green-50 dark:bg-green-950">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    File is Uploaded
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {currentData.metadata.totalRecords.toLocaleString()} records
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {currentData.fileName}
                    </span>
                    <Badge variant="secondary">
                      {(currentData.size / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                    {(currentData as any)._hasDataInIndexedDB && (
                      <Badge variant="outline" className="text-blue-600">
                        IndexedDB
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Data loaded and ready for analysis
                    {(currentData as any)._hasDataInIndexedDB && ' (stored in IndexedDB for optimal performance)'}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDebugJson}
                      className="flex items-center gap-2"
                    >
                      <Bug className="h-4 w-4" />
                      Debug JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearData}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Data
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      {!currentData ? (
        <div className="space-y-6">
          <DropZone 
            pageId={pageId}
            customTitle={pageId === 'browserHistory' ? 'Upload Browser History Data' : undefined}
            customDescription={pageId === 'browserHistory' ? 'Upload your browser history file first, then optionally add device information below for enhanced device-wise analysis.' : undefined}
          />
          {additionalUpload}
        </div>
      ) : (
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts">Charts & Analysis</TabsTrigger>
            <TabsTrigger value="upload">Upload New Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="mt-6">
            {children}
          </TabsContent>
          
          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              <DropZone 
                pageId={pageId}
                customTitle={pageId === 'browserHistory' ? 'Upload New Browser History Data' : undefined}
                customDescription={pageId === 'browserHistory' ? 'Upload your browser history file first, then optionally add device information below for enhanced device-wise analysis.' : undefined}
              />
              {additionalUpload}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}