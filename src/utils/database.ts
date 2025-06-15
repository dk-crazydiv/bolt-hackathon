import Dexie, { Table } from 'dexie'
import { ParsedData } from '../types'

export class DataExplorerDB extends Dexie {
  parsedFiles!: Table<ParsedData>

  constructor() {
    super('DataExplorerDB')
    this.version(1).stores({
      parsedFiles: 'id, type, fileName, parsedAt, size'
    })
  }
}

export const db = new DataExplorerDB()