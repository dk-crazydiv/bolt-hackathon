import React, { useMemo, useState } from 'react'
import { Search, Key, Eye, EyeOff, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useDataStore } from '@/store/dataStore'
import { cn } from '@/lib/utils'

interface JsonDebugViewProps {
  data?: any
}

interface JsonKeyViewProps {
  data: any
  path?: string
}

const JsonKeyView: React.FC<JsonKeyViewProps> = ({ data, path = '' }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const toggleKey = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const renderKeyStructure = (obj: any, currentPath: string = '', level: number = 0): React.ReactNode => {
    if (typeof obj !== 'object' || obj === null) {
      return (
        <div className="text-sm text-muted-foreground ml-4">
          {typeof obj} {Array.isArray(obj) ? `[${obj.length}]` : ''}
        </div>
      )
    }

    if (Array.isArray(obj)) {
      return (
        <div className="ml-4">
          <div className="text-sm text-muted-foreground">
            Array [{obj.length} items]
          </div>
          {obj.length > 0 && (
            <div className="ml-4 mt-1">
              <div className="text-xs text-muted-foreground">Sample item structure:</div>
              {renderKeyStructure(obj[0], `${currentPath}[0]`, level + 1)}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {Object.entries(obj).map(([key, value]) => {
          const keyPath = currentPath ? `${currentPath}.${key}` : key
          const isExpanded = expandedKeys.has(keyPath)
          const hasChildren = typeof value === 'object' && value !== null
          
          return (
            <div key={key} className="border-l border-border ml-2 pl-2">
              <div className="flex items-center space-x-2 py-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => toggleKey(keyPath)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {!hasChildren && <div className="w-4" />}
                
                <Key className="h-3 w-3 text-primary" />
                <span className="font-mono text-sm">{key}</span>
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(value) 
                    ? `array[${value.length}]`
                    : typeof value === 'object' && value !== null
                    ? 'object'
                    : typeof value
                  }
                </Badge>
              </div>
              
              {hasChildren && isExpanded && (
                <div className="ml-4">
                  {renderKeyStructure(value, keyPath, level + 1)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4">
        {renderKeyStructure(data)}
      </div>
    </ScrollArea>
  )
}

interface JsonValueViewProps {
  data: any[]
  searchTerm: string
}

const JsonValueView: React.FC<JsonValueViewProps> = ({ data, searchTerm }) => {
  const [visibleItems, setVisibleItems] = useState(10)
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const loadMore = () => {
    setVisibleItems(prev => prev + 10)
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4 p-4">
        {filteredData.slice(0, visibleItems).map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Record {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(item, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
        
        {visibleItems < filteredData.length && (
          <div className="text-center">
            <Button onClick={loadMore} variant="outline">
              Load More ({filteredData.length - visibleItems} remaining)
            </Button>
          </div>
        )}
        
        {filteredData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {searchTerm ? 'No records match your search' : 'No data to display'}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export const JsonDebugView: React.FC<JsonDebugViewProps> = ({ data: propData }) => {
  const { debugJsonData } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  
  const currentFile = propData || debugJsonData

  const flattenedData = useMemo(() => {
    if (!currentFile) return []

    if (currentFile.type === 'json') {
      return Array.isArray(currentFile.data) ? currentFile.data : [currentFile.data]
    } else {
      // Flatten takeout data
      const flattened: any[] = []
      for (const [fileName, content] of Object.entries(currentFile.data)) {
        if (Array.isArray(content)) {
          flattened.push(...content.map(item => ({ _fileName: fileName, ...item })))
        } else {
          flattened.push({ _fileName: fileName, ...content })
        }
      }
      return flattened
    }
  }, [currentFile])

  const sampleData = useMemo(() => {
    return flattenedData.length > 0 ? flattenedData[0] : {}
  }, [flattenedData])

  if (!currentFile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No file selected</CardTitle>
              <CardDescription>Please upload a file first to view its contents.</CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Debug JSON View</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="default">
            {currentFile.metadata.totalRecords.toLocaleString()} records
          </Badge>
          <Badge variant="secondary">
            {currentFile.type.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            {(currentFile.size / 1024 / 1024).toFixed(1)} MB
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Key Structure
          </TabsTrigger>
          <TabsTrigger value="values" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Data Values
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Key Structure</CardTitle>
              <CardDescription>
                Explore the structure and hierarchy of your JSON data keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JsonKeyView data={sampleData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="values" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Data Values</CardTitle>
              <CardDescription>
                Browse through your actual data records with search functionality
              </CardDescription>
              <div className="flex items-center space-x-2 pt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in JSON data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <JsonValueView data={flattenedData} searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}