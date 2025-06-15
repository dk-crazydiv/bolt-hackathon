import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileJson, Archive, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFileParser } from '@/hooks/useFileParser'
import { useDataStore } from '@/store/dataStore'
import { cn } from '@/lib/utils'

export const DropZone: React.FC = () => {
  const { parseFile, cancelParsing } = useFileParser()
  const { parseProgress, isLoading } = useDataStore()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/json': ['.json'],
      'text/json': ['.json']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0])
      }
    }
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-200",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary hover:bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <CardTitle className="mb-2">
            {isDragActive ? 'Drop your file here' : 'Upload your data file'}
          </CardTitle>
          
          <CardDescription className="mb-4 max-w-sm">
            Drag and drop your file here, or click to browse. Supports large files (100MB+).
          </CardDescription>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Archive className="h-3 w-3" />
              ZIP files
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileJson className="h-3 w-3" />
              JSON files
            </Badge>
            <Badge variant="outline">Large files (100MB+)</Badge>
          </div>
        </CardContent>
      </Card>

      {parseProgress && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {parseProgress.status === 'parsing' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {parseProgress.status === 'complete' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {parseProgress.status === 'error' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <CardTitle className="text-lg">{parseProgress.fileName}</CardTitle>
              </div>
              <Badge variant="outline">
                {formatFileSize(parseProgress.totalSize)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {parseProgress.status === 'parsing' && (
              <div className="space-y-4">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${parseProgress.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {parseProgress.recordsProcessed.toLocaleString()} records processed
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelParsing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {parseProgress.status === 'complete' && (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="text-green-700 dark:text-green-300">
                  Successfully parsed {parseProgress.recordsProcessed.toLocaleString()} records
                </span>
              </div>
            )}

            {parseProgress.status === 'error' && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-destructive text-sm">{parseProgress.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}