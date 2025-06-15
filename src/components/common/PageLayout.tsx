import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bug, Trash2, Database, CheckCircle, Smartphone, ArrowLeft } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DropZone } from '@/components/common/DropZone'
import { useDataStore } from '@/store/dataStore'
import { ParsedData } from '@/types'
import { cn } from '@/lib/utils'

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
  const [showUpload, setShowUpload] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

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

  const handleShowUpload = () => {
    setIsTransitioning(true)
    // Small delay to allow transition to start
    setTimeout(() => {
      setShowUpload(true)
      setIsTransitioning(false)
    }, 150)
  }

  const handleBackToCharts = () => {
    setIsTransitioning(true)
    // Small delay to allow transition to start
    setTimeout(() => {
      setShowUpload(false)
      setIsTransitioning(false)
    }, 150)
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
          <div className="flex items-center gap-4">
            {showUpload && hasAnyData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCharts}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Charts
              </Button>
            )}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          
          {/* File status in same row as title */}
          {hasAnyData && (
            <div className={cn(
              "flex items-center gap-3 transition-all duration-300 ease-in-out",
              isTransitioning && "opacity-50 transform translate-x-4"
            )}>
              {/* Main data file status */}
              {currentData && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200 hover:scale-105"
                  onClick={handleShowUpload}
                  title="Click to upload new data"
                >
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDebugJson(currentData)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Bug className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearData(pageId)
                      }}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Device info status for browser history page - show if exists OR if no device data but has browser data */}
              {pageId === 'browserHistory' && deviceData && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 hover:scale-105"
                  onClick={handleShowUpload}
                  title="Click to upload new device data"
                >
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDebugJson(deviceData)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Bug className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearData('deviceInfo')
                      }}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Show device upload option for browser history page when no device data but has browser data */}
              {pageId === 'browserHistory' && currentData && !deviceData && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-all duration-200 hover:scale-105"
                  onClick={handleShowUpload}
                  title="Click to upload device data for enhanced analysis"
                >
                  <Smartphone className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Upload Device Data
                  </span>
                  <Badge variant="outline" className="text-xs text-yellow-600">
                    Optional
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* Show upload options when no data exists - for browser history page specifically */}
          {!hasAnyData && pageId === 'browserHistory' && (
            <div className={cn(
              "flex items-center gap-3 transition-all duration-300 ease-in-out",
              isTransitioning && "opacity-50 transform translate-x-4"
            )}>
              {/* Browser data upload - primary */}
              <div 
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 hover:scale-105"
                onClick={handleShowUpload}
                title="Click to upload browser history data"
              >
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Upload Browser Data
                </span>
                <Badge variant="outline" className="text-xs text-blue-600">
                  Required
                </Badge>
              </div>
              
              {/* Device data upload - secondary */}
              <div 
                className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-all duration-200 hover:scale-105"
                onClick={handleShowUpload}
                title="Click to upload device data for enhanced analysis"
              >
                <Smartphone className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Upload Device Data
                </span>
                <Badge variant="outline" className="text-xs text-yellow-600">
                  Optional
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-lg mb-4">{description}</p>
      </div>

      {!hasAnyData || showUpload ? (
        <div className={cn(
          "space-y-6 transition-all duration-500 ease-in-out",
          showUpload ? "opacity-100 transform translate-y-0" : "opacity-100 transform translate-y-0",
          isTransitioning && !showUpload && "opacity-0 transform translate-y-4"
        )}>
          {/* No data state - show click to upload message - only when NOT in upload mode */}
          {!hasAnyData && !showUpload && (
            <Card 
              className={cn(
                "border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg",
                isTransitioning && "opacity-50 transform scale-95"
              )}
              onClick={handleShowUpload}
            >
              <CardContent className="flex items-center justify-center py-12 text-center">
                <div>
                  <Database className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                  <CardTitle className="mb-2 text-primary">No data uploaded</CardTitle>
                  <CardDescription className="mb-4">
                    Click here to upload your {title.toLowerCase()} data and start exploring insights
                  </CardDescription>
                  <Badge variant="outline" className="text-primary border-primary">
                    Click to upload
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Show formats and examples only when in upload mode and no data exists */}
          {!hasAnyData && showUpload && (
            <div className={cn(
              "space-y-4 transition-all duration-500 ease-in-out",
              showUpload ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"
            )}>
              {/* Compact info panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Accepted formats panel */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Accepted Formats</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {acceptedFormats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Data examples panel */}
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800 dark:text-green-200">Data Examples</h4>
                  </div>
                  <ul className="space-y-1">
                    {examples.slice(0, 3).map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-green-700 dark:text-green-300">
                        <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                    {examples.length > 3 && (
                      <li className="text-xs text-green-600 dark:text-green-400 italic">
                        +{examples.length - 3} more formats supported
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Show upload interface when showUpload is true */}
          {showUpload && (
            <div className={cn(
              "transition-all duration-500 ease-in-out",
              showUpload ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"
            )}>
              <DropZone 
                pageId={pageId}
                customTitle={pageId === 'browserHistory' ? 'Upload Browser History Data' : undefined}
                customDescription={pageId === 'browserHistory' ? 'Upload your browser history file first, then optionally add device information below for enhanced device-wise analysis.' : undefined}
              />
              {additionalUpload}
            </div>
          )}
        </div>
      ) : (
        // Show charts when data exists and not in upload mode
        <div className={cn(
          "transition-all duration-500 ease-in-out",
          !showUpload ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4",
          isTransitioning && showUpload && "opacity-50 transform scale-95"
        )}>
          {children}
        </div>
      )}
    </div>
  )
}