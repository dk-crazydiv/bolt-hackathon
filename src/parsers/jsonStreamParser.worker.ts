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
          console.log('Parsed JSON structure:', Object.keys(data || {}))
          
          // Count records properly based on data structure
          recordsProcessed = this.countRecords(data)
          console.log('Total records counted:', recordsProcessed)
          
          if (Array.isArray(data)) {
            // Handle array of objects
            data.forEach((item, index) => {
              if (this.abortController?.signal.aborted) return
              
              currentChunk.push(item)
              
              if (currentChunk.length >= chunkSize) {
                chunks.push([...currentChunk])
                currentChunk = []
                
                // Send progress update
                self.postMessage({
                  type: 'progress',
                  payload: {
                    fileName: file.name,
                    progress: ((index + 1) / data.length) * 100,
                    status: 'parsing',
                    recordsProcessed: index + 1,
                    totalSize: file.size
                  }
                })
              }
            })
          } else {
            // Handle single object or nested structure
            chunks.push([data])
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
            data: Array.isArray(data) ? data : data,
            metadata: {
              totalRecords: recordsProcessed,
              fileStructure: this.getFileStructure(data),
              dataTypes: this.inferDataTypes(data)
            }
          }
          
          console.log('Final parsed data metadata:', parsedData.metadata)
          resolve(parsedData)
          
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  private countRecords(data: any): number {
    console.log('Counting records in data:', typeof data, Array.isArray(data))
    
    if (Array.isArray(data)) {
      console.log('Data is array, count:', data.length)
      return data.length
    }
    
    if (typeof data === 'object' && data !== null) {
      let totalCount = 0
      
      // Special handling for Browser History structure
      if (data["Browser History"]) {
        console.log('Found Browser History key')
        const browserHistory = data["Browser History"]
        
        if (Array.isArray(browserHistory)) {
          console.log('Browser History is array, count:', browserHistory.length)
          return browserHistory.length
        }
        
        if (typeof browserHistory === 'object') {
          console.log('Browser History is object, keys:', Object.keys(browserHistory))
          // Look for arrays within Browser History
          for (const [key, value] of Object.entries(browserHistory)) {
            if (Array.isArray(value)) {
              console.log(`Found array in Browser History.${key}, count:`, value.length)
              totalCount += value.length
            }
          }
          if (totalCount > 0) {
            console.log('Total count from Browser History arrays:', totalCount)
            return totalCount
          }
        }
      }
      
      // Check for common browser history patterns
      const possibleKeys = [
        'visits', 'history', 'browsing_history', 'browser_history',
        'urls', 'sites', 'pages', 'records', 'entries', 'items'
      ]
      
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`Found array at key "${key}", count:`, data[key].length)
          totalCount += data[key].length
        }
      }
      
      if (totalCount > 0) {
        console.log('Total count from known keys:', totalCount)
        return totalCount
      }
      
      // General approach: count all arrays in the object
      const countArraysRecursively = (obj: any): number => {
        let count = 0
        
        if (Array.isArray(obj)) {
          return obj.length
        }
        
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {
              console.log(`Found array at ${key}, length:`, value.length)
              count += value.length
            } else if (typeof value === 'object' && value !== null) {
              count += countArraysRecursively(value)
            }
          }
        }
        
        return count
      }
      
      totalCount = countArraysRecursively(data)
      console.log('Total recursive count:', totalCount)
      
      // If no arrays found, treat as single record
      return totalCount > 0 ? totalCount : 1
    }
    
    // Primitive value
    return 1
  }

  private getFileStructure(data: any): string[] {
    if (Array.isArray(data)) {
      return data.length > 0 ? Object.keys(data[0] || {}) : []
    } else if (typeof data === 'object' && data !== null) {
      const structure: string[] = []
      const traverse = (obj: any, path: string = '') => {
        if (Array.isArray(obj)) {
          structure.push(`${path}[${obj.length}]`)
          if (obj.length > 0 && typeof obj[0] === 'object') {
            Object.keys(obj[0]).forEach(key => {
              structure.push(`${path}[].${key}`)
            })
          }
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            const newPath = path ? `${path}.${key}` : key
            structure.push(newPath)
            if (typeof obj[key] === 'object') {
              traverse(obj[key], newPath)
            }
          })
        }
      }
      traverse(data)
      return structure
    }
    return []
  }

  private inferDataTypes(obj: any): Record<string, string> {
    if (Array.isArray(obj)) {
      return obj.length > 0 ? this.inferDataTypes(obj[0]) : {}
    }
    
    const types: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(obj || {})) {
      if (value === null) {
        types[key] = 'null'
      } else if (Array.isArray(value)) {
        types[key] = `array[${value.length}]`
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