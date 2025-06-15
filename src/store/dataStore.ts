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
        set((state) => {
          console.log(`Setting data for page ${page}:`, data?.metadata?.totalRecords, 'records')
          return {
            [`${page}Data`]: data,
          }
        }),

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
      partialize: (state) => {
        // Helper function to exclude the large data array from ParsedData
        const excludeDataArray = (parsedData: ParsedData | null) => {
          if (!parsedData) return null
          return {
            ...parsedData,
            data: [] // Store empty array instead of the full data to save space
          }
        }

        return {
          googleMapsTimelineData: excludeDataArray(state.googleMapsTimelineData),
          browserHistoryData: excludeDataArray(state.browserHistoryData),
          youtubeHistoryData: excludeDataArray(state.youtubeHistoryData),
          playstoreAppsData: excludeDataArray(state.playstoreAppsData),
          fitbitData: excludeDataArray(state.fitbitData),
          googleMapReviewsData: excludeDataArray(state.googleMapReviewsData),
          debugJsonData: excludeDataArray(state.debugJsonData)
        }
      }
    }
  )
)