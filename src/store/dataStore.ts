import { create } from 'zustand'
import { ParsedData, ParseProgress } from '../types'

interface DataState {
  parsedFiles: ParsedData[]
  currentFile: ParsedData | null
  parseProgress: ParseProgress | null
  isLoading: boolean
  
  // Actions
  addParsedFile: (file: ParsedData) => void
  setCurrentFile: (file: ParsedData | null) => void
  setParseProgress: (progress: ParseProgress | null) => void
  setLoading: (loading: boolean) => void
  clearData: () => void
}

export const useDataStore = create<DataState>((set) => ({
  parsedFiles: [],
  currentFile: null,
  parseProgress: null,
  isLoading: false,

  addParsedFile: (file) =>
    set((state) => ({
      parsedFiles: [...state.parsedFiles, file],
      currentFile: file,
    })),

  setCurrentFile: (file) => set({ currentFile: file }),

  setParseProgress: (progress) => set({ parseProgress: progress }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearData: () =>
    set({
      parsedFiles: [],
      currentFile: null,
      parseProgress: null,
      isLoading: false,
    }),
}))