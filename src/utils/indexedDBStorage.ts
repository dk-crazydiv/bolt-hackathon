import Dexie, { Table } from 'dexie'
import { ParsedData } from '../types'

export interface StoredData {
  id: string
  pageId: string
  data: ParsedData
  createdAt: Date
  updatedAt: Date
}

class DataExplorerDB extends Dexie {
  storedData!: Table<StoredData>

  constructor() {
    super('DataExplorerDB')
    this.version(1).stores({
      storedData: 'id, pageId, createdAt, updatedAt'
    })
  }
}

export const db = new DataExplorerDB()

export class IndexedDBStorage {
  static async setPageData(pageId: string, data: ParsedData | null): Promise<void> {
    if (!data) {
      await this.clearPageData(pageId)
      return
    }

    const storedData: StoredData = {
      id: `${pageId}-${data.id}`,
      pageId,
      data,
      createdAt: data.parsedAt,
      updatedAt: new Date()
    }

    try {
      await db.storedData.put(storedData)
      console.log(`✅ Stored data for page ${pageId} in IndexedDB`)
    } catch (error) {
      console.error(`❌ Failed to store data for page ${pageId}:`, error)
      throw error
    }
  }

  static async getPageData(pageId: string): Promise<ParsedData | null> {
    try {
      const storedArray = await db.storedData
        .where('pageId')
        .equals(pageId)
        .toArray()

      // Sort by updatedAt in descending order and get the most recent
      const stored = storedArray
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .at(0)
        
      if (stored) {
        console.log(`✅ Retrieved data for page ${pageId} from IndexedDB`)
        return stored.data
      }

      console.log(`ℹ️ No data found for page ${pageId} in IndexedDB`)
      return null
    } catch (error) {
      console.error(`❌ Failed to retrieve data for page ${pageId}:`, error)
      return null
    }
  }

  static async clearPageData(pageId: string): Promise<void> {
    try {
      await db.storedData.where('pageId').equals(pageId).delete()
      console.log(`✅ Cleared data for page ${pageId} from IndexedDB`)
    } catch (error) {
      console.error(`❌ Failed to clear data for page ${pageId}:`, error)
      throw error
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await db.storedData.clear()
      console.log(`✅ Cleared all data from IndexedDB`)
    } catch (error) {
      console.error(`❌ Failed to clear all data:`, error)
      throw error
    }
  }

  static async getAllStoredPages(): Promise<string[]> {
    try {
      const pages = await db.storedData
        .orderBy('pageId')
        .uniqueKeys()
      
      return pages as string[]
    } catch (error) {
      console.error(`❌ Failed to get stored pages:`, error)
      return []
    }
  }

  static async getStorageInfo(): Promise<{ totalRecords: number; totalSize: number }> {
    try {
      const allData = await db.storedData.toArray()
      const totalRecords = allData.reduce((sum, item) => sum + item.data.metadata.totalRecords, 0)
      const totalSize = allData.reduce((sum, item) => sum + item.data.size, 0)
      
      return { totalRecords, totalSize }
    } catch (error) {
      console.error(`❌ Failed to get storage info:`, error)
      return { totalRecords: 0, totalSize: 0 }
    }
  }
}