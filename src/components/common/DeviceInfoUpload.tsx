import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFileParser } from '@/hooks/useFileParser'
import { useDataStore } from '@/store/dataStore'
import { cn } from '@/lib/utils'

export const DeviceInfoUpload: React.FC = () => {
  const { parseFile } = useFileParser()
  const { getPageData, parseProgress } = useDataStore()
  const deviceData = getPageData('deviceInfo')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/json': ['.json'],
      'text/json': ['.json']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        parseFile(acceptedFiles[0], 'deviceInfo')
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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">📱 Device Information (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your device-information.json file to enable device-wise browsing analysis. 
          This will show which devices you use for browsing and their usage patterns.
        </p>
      </div>

      {!deviceData ? (
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
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <CardTitle className="text-base mb-2">
              {isDragActive ? 'Drop device info here' : 'Upload device-information.json'}
            </CardTitle>
            
            <CardDescription className="mb-3 max-w-sm text-sm">
              Drag and drop your device information file here, or click to browse.
            </CardDescription>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">
                device-information.json
              </Badge>
              <Badge variant="outline" className="text-xs">From Google Takeout</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">{deviceData.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {deviceData.metadata.totalRecords} devices • {formatFileSize(deviceData.size)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Device Info Loaded</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear device data
                  useDataStore.getState().clearPageData('deviceInfo')
                }}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {parseProgress && parseProgress.fileName.includes('device') && (
        <Card>
          <CardContent className="p-4">
            {parseProgress.status === 'parsing' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Processing device information...</span>
              </div>
            )}

            {parseProgress.status === 'complete' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Device information loaded successfully!</span>
              </div>
            )}

            {parseProgress.status === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">{parseProgress.error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm">💡 What you'll get with device info:</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Device-wise browsing patterns (mobile, tablet, laptop)</li>
          <li>• Cross-device usage analysis</li>
          <li>• Peak usage hours for each device type</li>
          <li>• Shared websites across devices</li>
          <li>• Device switching patterns</li>
        </ul>
      </div>
    </div>
  )
}