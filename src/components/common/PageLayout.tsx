import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bug, Trash2, Database, CheckCircle, Smartphone } from 'lucide-react'
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
  const deviceData = getPageData('deviceInfo') // Get device info data for browser history page

  // Load data from IndexedDB when component mounts
  useEffect(() => {
    const loadData = async () => {
      // If we have metadata but no actual data, load from IndexedDB
      if (currentData && !currentData.data && (currentData as any)._hasDataInIndexedDB) {
        await loadPageDataFromDB(pageId)
      }
      if (deviceData && !deviceData.data && (deviceData as any)._hasDataInIndexedDB) {
        await loadPageDataFromDB('deviceInfo')
      }
    }
    
    loadData()
  }, [pageId, loadPageDataFromDB, currentData, deviceData])

  const handleClearData = async (dataPageId: string) => {
    await clearPageData(dataPageId)
  }

  const handleDebugJson = (data: ParsedData) => {
    navigate('/debug-json', { state: { data } })
  }

  const renderFileAccordion = (data: ParsedData, dataPageId: string, fileTitle: string, fileDescription: string) => (
    <AccordionItem value={`uploaded-file-${dataPageId}`} className="border rounded-lg bg-green-50 dark:bg-green-950">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <span className="font-medium text-green-700 dark:text-green-300">
              {fileTitle}
            </span>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {fileDescription}
            </p>
          </div>
          <div className="flex gap-2 ml-auto">
            <Badge variant="outline">
              {data.metadata.totalRecords.toLocaleString()} records
            </Badge>
            <Badge variant="secondary">
              {(data.size / 1024 / 1024).toFixed(1)} MB
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Database className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-300">
              {data.fileName}
            </span>
            {(data as any)._hasDataInIndexedDB && (
              <Badge variant="outline" className="text-blue-600">
                IndexedDB
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-green-600 dark:text-green-400">
            Data loaded and ready for analysis
            {(data as any)._hasDataInIndexedDB && ' (stored in IndexedDB for optimal performance)'}
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDebugJson(data)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              Debug JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearData(dataPageId)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )

  const hasAnyData = currentData || (pageId === 'browserHistory' && deviceData)

  return (
    <div className="space-y-6">
      <div>
        {/* Title row with file status */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          
          {/* File status in same row as title */}
          {hasAnyData && (
            <div className="flex items-center gap-3">
              {/* Main data file status */}
              {currentData && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Data Loaded
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentData.metadata.totalRecords.toLocaleString()}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDebugJson(currentData)}
                      className="h-6 px-2 text-xs"
                    >
                      <Bug className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearData(pageId)}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Device info status for browser history page */}
              {pageId === 'browserHistory' && deviceData && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Device Info
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {deviceData.metadata.totalRecords.toLocaleString()}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDebugJson(deviceData)}
                      className="h-6 px-2 text-xs"
                    >
                      <Bug className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearData('deviceInfo')}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-lg mb-4">{description}</p>
      </div>

      {!hasAnyData ? (
        <div className="space-y-6">
          {/* Show formats and examples prominently when no data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Accepted File Formats
                </CardTitle>
                <CardDescription>
                  Upload files in any of these supported formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {acceptedFormats.map((format) => (
                    <Badge key={format} variant="secondary" className="text-sm">
                      {format}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Data Examples
                </CardTitle>
                <CardDescription>
                  Examples of data sources that work with this analyzer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
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