import { useCallback, useRef } from 'react'
import * as Comlink from 'comlink'
import { useDataStore } from '../store/dataStore'
import { ParsedData } from '../types'

export const useFileParser = () => {
  const { setParseProgress, setPageData, setLoading } = useDataStore()
  const workerRef = useRef<any>(null)

  const parseFile = useCallback(async (file: File, pageId: string) => {
    setLoading(true)
    setParseProgress({
      fileName: file.name,
      progress: 0,
      status: 'parsing',
      recordsProcessed: 0,
      totalSize: file.size
    })

    try {
      let worker: Worker
      let parser: any

      if (file.name.endsWith('.zip')) {
        worker = new Worker(new URL('../parsers/takeoutParser.worker.ts', import.meta.url), {
          type: 'module'
        })
        parser = Comlink.wrap(worker)
      } else if (file.name.endsWith('.json')) {
        worker = new Worker(new URL('../parsers/jsonStreamParser.worker.ts', import.meta.url), {
          type: 'module'
        })
        parser = Comlink.wrap(worker)
      } else {
        throw new Error('Unsupported file type. Please upload a ZIP or JSON file.')
      }

      workerRef.current = { worker, parser }

      // Listen for progress updates
      worker.addEventListener('message', (event) => {
        const { type, payload } = event.data
        if (type === 'progress') {
          setParseProgress(payload)
        }
      })

      const parsedData: ParsedData = await parser.parseFile({ file })
      
      // Update store for specific page
      setPageData(pageId, parsedData)
      
      setParseProgress({
        fileName: file.name,
        progress: 100,
        status: 'complete',
        recordsProcessed: parsedData.metadata.totalRecords,
        totalSize: file.size
      })

      worker.terminate()
      workerRef.current = null

    } catch (error) {
      setParseProgress({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        recordsProcessed: 0,
        totalSize: file.size
      })
      
      if (workerRef.current) {
        workerRef.current.worker.terminate()
        workerRef.current = null
      }
    } finally {
      setLoading(false)
    }
  }, [setParseProgress, setPageData, setLoading])

  const cancelParsing = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.parser.abort()
      workerRef.current.worker.terminate()
      workerRef.current = null
      setLoading(false)
      setParseProgress(null)
    }
  }, [setLoading, setParseProgress])

  return { parseFile, cancelParsing }
}