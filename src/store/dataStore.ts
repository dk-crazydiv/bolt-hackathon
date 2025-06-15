import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ParsedData, ParseProgress } from '../types'

interface DataState {
  // Data storage per page
  googleMapsTimelineData: ParsedData | null
  browserHistoryData: ParsedData | null
  youtubeHistoryData: ParsedData | null
  playstoreAppsData: ParsedData | null
  fitbitData: ParsedData | null
  googleMapReviewsData: ParsedData | null
  debugJsonData: ParsedData | null
  
  // Current parsing state
  parseProgress: ParseProgress | null
  isLoading: boolean
  
  // Actions
  setPageData: (page: string, data: ParsedData | null) => void
  getPageData: (page: string) => ParsedData | null
  clearPageData: (page: string) => void
  setParseProgress: (progress: ParseProgress | null) => void
  setLoading: (loading: boolean) => void
  clearAllData: () => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial state
      googleMapsTimelineData: null,
      browserHistoryData: null,
      youtubeHistoryData: null,
      playstoreAppsData: null,
      fitbitData: null,
      googleMapReviewsData: null,
      debugJsonData: null,
      parseProgress: null,
      isLoading: false,

      // Actions
      setPageData: (page, data) =>
        set((state) => ({
          [`${page}Data`]: data,
        })),

      getPageData: (page) => {
        const state = get()
        return state[`${page}Data` as keyof DataState] as ParsedData | null
      },

      clearPageData: (page) =>
        set((state) => ({
          [`${page}Data`]: null,
        })),

      setParseProgress: (progress) => set({ parseProgress: progress }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAllData: () =>
        set({
          googleMapsTimelineData: null,
          browserHistoryData: null,
          youtubeHistoryData: null,
          playstoreAppsData: null,
          fitbitData: null,
          googleMapReviewsData: null,
          debugJsonData: null,
          parseProgress: null,
          isLoading: false,
        }),
    }),
    {
      name: 'data-explorer-storage',
      partialize: (state) => ({
        // Only persist non-data state to avoid localStorage quota issues
        // Large parsed data objects are excluded from persistence
      }),
    }
  )
)