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
          console.log('🔍 Parsed JSON structure:', Object.keys(data || {}))
          
          // Extract actual data for processing
          const extractedData = this.extractDataForProcessing(data)
          console.log('📊 Extracted data for processing:', {
            type: typeof extractedData,
            isArray: Array.isArray(extractedData),
            length: Array.isArray(extractedData) ? extractedData.length : 'N/A',
            keys: typeof extractedData === 'object' && !Array.isArray(extractedData) ? Object.keys(extractedData) : 'N/A'
          })
          
          // Count records properly based on extracted data
          recordsProcessed = this.countRecords(extractedData)
          console.log('📈 Total records counted:', recordsProcessed)
          
          if (Array.isArray(extractedData)) {
            // Handle array of objects
            extractedData.forEach((item, index) => {
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
                    progress: ((index + 1) / extractedData.length) * 100,
                    status: 'parsing',
                    recordsProcessed: index + 1,
                    totalSize: file.size
                  }
                })
              }
            })
          } else {
            // Handle single object or nested structure
            chunks.push([extractedData])
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
            data: extractedData, // Use extracted data instead of original
            metadata: {
              totalRecords: recordsProcessed,
              fileStructure: this.getFileStructure(data), // Keep original structure for metadata
              dataTypes: this.inferDataTypes(data)
            }
          }
          
          console.log('✅ Final parsed data metadata:', parsedData.metadata)
          console.log('📊 Final data sample:', Array.isArray(extractedData) ? extractedData[0] : extractedData)
          resolve(parsedData)
          
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  private extractDataForProcessing(data: any): any {
    console.log('🔍 Extracting data for processing from:', typeof data, Array.isArray(data))
    
    if (Array.isArray(data)) {
      console.log('✅ Data is already an array, returning as-is')
      return data
    }
    
    if (typeof data === 'object' && data !== null) {
      // Special handling for Device Info structure
      if (data["Device Info"]) {
        console.log('📱 Found Device Info key')
        const deviceInfo = data["Device Info"]
        
        if (Array.isArray(deviceInfo)) {
          console.log('✅ Device Info is array, returning it')
          return deviceInfo
        }
      }
      
      // Special handling for Browser History structure
      if (data["Browser History"]) {
        console.log('🌐 Found Browser History key')
        const browserHistory = data["Browser History"]
        
        if (Array.isArray(browserHistory)) {
          console.log('✅ Browser History is array, returning it')
          return browserHistory
        }
        
        if (typeof browserHistory === 'object') {
          console.log('🔍 Browser History is object, searching for arrays...')
          // Look for arrays within Browser History
          for (const [key, value] of Object.entries(browserHistory)) {
            if (Array.isArray(value) && value.length > 0) {
              console.log(`✅ Found array in Browser History.${key}, returning it`)
              return value
            }
          }
        }
      }
      
      // Check for common browser history patterns
      const possibleKeys = [
        'visits', 'history', 'browsing_history', 'browser_history',
        'urls', 'sites', 'pages', 'records', 'entries', 'items',
        'History', 'Visits', 'BrowsingHistory', 'Device Info', 'deviceInfo', 'devices'
      ]
      
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
          console.log(`✅ Found array at key "${key}", returning it`)
          return data[key]
        }
      }
      
      // Look for nested structures
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const nestedKey of possibleKeys) {
            if (value[nestedKey] && Array.isArray(value[nestedKey]) && value[nestedKey].length > 0) {
              console.log(`✅ Found array at nested key "${key}.${nestedKey}", returning it`)
              return value[nestedKey]
            }
          }
        }
      }
      
      // Deep search for any meaningful array
      const findLargestArray = (obj: any, path: string = ''): { array: any[], path: string } | null => {
        let largestArray: { array: any[], path: string } | null = null
        
        if (Array.isArray(obj) && obj.length > 0) {
          // Check if this looks like browser history data
          const sample = obj[0]
          if (typeof sample === 'object' && sample !== null) {
            const hasUrlLike = sample.url || sample.URL || sample.uri || sample.href || sample.link
            const hasTimeLike = sample.time_usec || sample.last_visit_time || sample.visit_time || 
                               sample.visitTime || sample.timestamp || sample.time || sample.date
            
            if (hasUrlLike || hasTimeLike || obj.length > 10) {
              return { array: obj, path }
            }
          }
          
          if (!largestArray || obj.length > largestArray.array.length) {
            largestArray = { array: obj, path }
          }
        }
        
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            const newPath = path ? `${path}.${key}` : key
            const result = findLargestArray(value, newPath)
            if (result && (!largestArray || result.array.length > largestArray.array.length)) {
              largestArray = result
            }
          }
        }
        
        return largestArray
      }
      
      const result = findLargestArray(data)
      if (result && result.array.length > 0) {
        console.log(`✅ Found largest array at path "${result.path}" with ${result.array.length} items`)
        return result.array
      }
      
      console.log('⚠️ No suitable array found, returning original object')
      return data
    }
    
    console.log('⚠️ Data is primitive, returning as-is')
    return data
  }

  private countRecords(data: any): number {
    console.log('📊 Counting records in data:', typeof data, Array.isArray(data))
    
    if (Array.isArray(data)) {
      console.log('✅ Data is array, count:', data.length)
      return data.length
    }
    
    if (typeof data === 'object' && data !== null) {
      let totalCount = 0
      
      // Special handling for Browser History structure
      if (data["Browser History"]) {
        console.log('🌐 Found Browser History key')
        const browserHistory = data["Browser History"]
        
        if (Array.isArray(browserHistory)) {
          console.log('✅ Browser History is array, count:', browserHistory.length)
          return browserHistory.length
        }
        
        if (typeof browserHistory === 'object') {
          console.log('🔍 Browser History is object, keys:', Object.keys(browserHistory))
          // Look for arrays within Browser History
          for (const [key, value] of Object.entries(browserHistory)) {
            if (Array.isArray(value)) {
              console.log(`📊 Found array in Browser History.${key}, count:`, value.length)
              totalCount += value.length
            }
          }
          if (totalCount > 0) {
            console.log('✅ Total count from Browser History arrays:', totalCount)
            return totalCount
          }
        }
      }
      
      // Check for common browser history patterns
      const possibleKeys = [
        'visits', 'history', 'browsing_history', 'browser_history',
        'urls', 'sites', 'pages', 'records', 'entries', 'items',
        'Device Info', 'deviceInfo', 'devices'
      ]
      
      for (const key of possibleKeys) {
        if (data[key] && Array.isArray(data[key])) {
          console.log(`📊 Found array at key "${key}", count:`, data[key].length)
          totalCount += data[key].length
        }
      }
      
      if (totalCount > 0) {
        console.log('✅ Total count from known keys:', totalCount)
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
              console.log(`📊 Found array at ${key}, length:`, value.length)
              count += value.length
            } else if (typeof value === 'object' && value !== null) {
              count += countArraysRecursively(value)
            }
          }
        }
        
        return count
      }
      
      totalCount = countArraysRecursively(data)
      console.log('📊 Total recursive count:', totalCount)
      
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