import * as Comlink from 'comlink'
import { unzip } from 'fflate'

interface ParseOptions {
  file: File
}

class TakeoutParser {
  private abortController: AbortController | null = null

  async parseFile({ file }: ParseOptions) {
    this.abortController = new AbortController()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer
          const uint8Array = new Uint8Array(arrayBuffer)
          
          // Unzip the file
          unzip(uint8Array, (err, unzipped) => {
            if (err) {
              reject(new Error(`Failed to unzip: ${err.message}`))
              return
            }
            
            const jsonFiles: Record<string, any> = {}
            let totalRecords = 0
            const fileStructure: string[] = []
            
            // Process each file in the ZIP
            for (const [fileName, fileData] of Object.entries(unzipped)) {
              if (this.abortController?.signal.aborted) return
              
              fileStructure.push(fileName)
              
              if (fileName.endsWith('.json')) {
                try {
                  const text = new TextDecoder().decode(fileData)
                  const data = JSON.parse(text)
                  jsonFiles[fileName] = data
                  
                  if (Array.isArray(data)) {
                    totalRecords += data.length
                  } else {
                    totalRecords += 1
                  }
                  
                  // Send progress update
                  self.postMessage({
                    type: 'progress',
                    payload: {
                      fileName: file.name,
                      progress: (Object.keys(jsonFiles).length / Object.keys(unzipped).length) * 100,
                      status: 'parsing',
                      recordsProcessed: totalRecords,
                      totalSize: file.size
                    }
                  })
                } catch (jsonError) {
                  console.warn(`Failed to parse JSON file ${fileName}:`, jsonError)
                }
              }
            }
            
            const parsedData = {
              id: `${file.name}-${Date.now()}`,
              type: 'takeout' as const,
              fileName: file.name,
              size: file.size,
              parsedAt: new Date(),
              data: jsonFiles,
              metadata: {
                totalRecords,
                fileStructure,
                dataTypes: this.inferDataTypes(jsonFiles)
              }
            }
            
            resolve(parsedData)
          })
          
        } catch (error) {
          reject(new Error(`Failed to process ZIP file: ${error}`))
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  private inferDataTypes(data: Record<string, any>): Record<string, string> {
    const types: Record<string, string> = {}
    
    for (const [fileName, content] of Object.entries(data)) {
      if (Array.isArray(content)) {
        types[fileName] = 'array'
      } else if (typeof content === 'object') {
        types[fileName] = 'object'
      } else {
        types[fileName] = typeof content
      }
    }
    
    return types
  }

  abort() {
    this.abortController?.abort()
  }
}

Comlink.expose(new TakeoutParser())