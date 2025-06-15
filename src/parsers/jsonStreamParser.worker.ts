import * as Comlink from 'comlink'
import oboe from 'oboe'

interface ParseOptions {
  file: File
  chunkSize?: number
}

class JsonStreamParser {
  private abortController: AbortController | null = null

  async parseFile({ file, chunkSize = 1000 }: ParseOptions) {
    this.abortController = new AbortController()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      let recordsProcessed = 0
      const chunks: any[] = []
      let currentChunk: any[] = []

      reader.onload = () => {
        const text = reader.result as string
        
        try {
          // Try parsing as complete JSON first
          const data = JSON.parse(text)
          
          if (Array.isArray(data)) {
            // Handle array of objects
            data.forEach((item, index) => {
              if (this.abortController?.signal.aborted) return
              
              currentChunk.push(item)
              recordsProcessed++
              
              if (currentChunk.length >= chunkSize) {
                chunks.push([...currentChunk])
                currentChunk = []
                
                // Send progress update
                self.postMessage({
                  type: 'progress',
                  payload: {
                    fileName: file.name,
                    progress: (recordsProcessed / data.length) * 100,
                    status: 'parsing',
                    recordsProcessed,
                    totalSize: file.size
                  }
                })
              }
            })
          } else {
            // Handle single object
            chunks.push([data])
            recordsProcessed = 1
          }
          
          // Add remaining items
          if (currentChunk.length > 0) {
            chunks.push(currentChunk)
          }
          
          const parsedData = {
            id: `${file.name}-${Date.now()}`,
            type: 'json' as const,
            fileName: file.name,
            size: file.size,
            parsedAt: new Date(),
            data: Array.isArray(data) ? data : [data],
            metadata: {
              totalRecords: recordsProcessed,
              fileStructure: Object.keys(Array.isArray(data) ? (data[0] || {}) : data),
              dataTypes: this.inferDataTypes(Array.isArray(data) ? (data[0] || {}) : data)
            }
          }
          
          resolve(parsedData)
          
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  private inferDataTypes(obj: Record<string, any>): Record<string, string> {
    const types: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        types[key] = 'null'
      } else if (Array.isArray(value)) {
        types[key] = 'array'
      } else if (typeof value === 'object') {
        types[key] = 'object'
      } else {
        types[key] = typeof value
      }
    }
    
    return types
  }

  abort() {
    this.abortController?.abort()
  }
}

Comlink.expose(new JsonStreamParser())