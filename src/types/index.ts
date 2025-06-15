export interface ParsedData {
  id: string
  type: 'takeout' | 'json'
  fileName: string
  size: number
  parsedAt: Date
  data: Record<string, any>
  metadata: {
    totalRecords: number
    fileStructure: string[]
    dataTypes: Record<string, string>
  }
}

export interface ParseProgress {
  fileName: string
  progress: number
  status: 'parsing' | 'complete' | 'error'
  error?: string
  recordsProcessed: number
  totalSize: number
}

export interface ChartQuestion {
  id: string
  title: string
  description: string
  chartType: 'line' | 'bar' | 'pie' | 'area'
  dataSelector: (data: ParsedData) => any[]
  xKey?: string
  yKey?: string
  groupBy?: string
}

export interface WorkerMessage {
  type: 'progress' | 'complete' | 'error' | 'chunk'
  payload: any
}