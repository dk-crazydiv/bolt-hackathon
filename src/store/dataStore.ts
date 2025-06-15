import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ParsedData, ParseProgress } from '../types'
import { IndexedDBStorage } from '../utils/indexedDBStorage'

interface DataState {
  // Data storage per page - now just metadata for localStorage
  googleMapsTimelineData: ParsedData | null
  browserHistoryData: ParsedData | null
  youtubeHistoryData: ParsedData | null
  playstoreAppsData: ParsedData | null
  fitbitData: ParsedData | null
  googleMapReviewsData: ParsedData | null
  deviceInfoData: ParsedData | null
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
  
  // IndexedDB actions
  loadPageDataFromDB: (page: string) => Promise<void>
  initializeFromDB: () => Promise<void>
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
      deviceInfoData: null,
      debugJsonData: null,
      parseProgress: null,
      isLoading: false,

      // Actions
      setPageData: async (page, data) => {
        console.log(`Setting data for page ${page}:`, data?.metadata?.totalRecords, 'records')
        
        // Store in IndexedDB
        try {
          await IndexedDBStorage.setPageData(page, data)
        } catch (error) {
          console.error('Failed to store in IndexedDB:', error)
        }
        
        // Update Zustand state
        set((state) => ({
          [`${page}Data`]: data,
        }))
      },

      getPageData: (page) => {
        const state = get()
        return state[`${page}Data` as keyof DataState] as ParsedData | null
      },

      clearPageData: async (page) => {
        // Clear from IndexedDB
        try {
          await IndexedDBStorage.clearPageData(page)
        } catch (error) {
          console.error('Failed to clear from IndexedDB:', error)
        }
        
        // Clear from Zustand state
        set((state) => ({
          [`${page}Data`]: null,
        }))
      },

      setParseProgress: (progress) => set({ parseProgress: progress }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAllData: async () => {
        // Clear from IndexedDB
        try {
          await IndexedDBStorage.clearAllData()
        } catch (error) {
          console.error('Failed to clear all data from IndexedDB:', error)
        }
        
        // Clear from Zustand state
        set({
          googleMapsTimelineData: null,
          browserHistoryData: null,
          youtubeHistoryData: null,
          playstoreAppsData: null,
          fitbitData: null,
          googleMapReviewsData: null,
          deviceInfoData: null,
          debugJsonData: null,
          parseProgress: null,
          isLoading: false,
        })
      },

      // Load data from IndexedDB for a specific page
      loadPageDataFromDB: async (page) => {
        try {
          const data = await IndexedDBStorage.getPageData(page)
          if (data) {
            set((state) => ({
              [`${page}Data`]: data,
            }))
          }
        } catch (error) {
          console.error(`Failed to load data for page ${page} from IndexedDB:`, error)
        }
      },

      // Initialize all data from IndexedDB on app start
      initializeFromDB: async () => {
        const pages = ['googleMapsTimeline', 'browserHistory', 'youtubeHistory', 'playstoreApps', 'fitbitData', 'googleMapReviews', 'deviceInfo', 'debugJson']
        
        for (const page of pages) {
          try {
            const data = await IndexedDBStorage.getPageData(page)
            if (data) {
              set((state) => ({
                [`${page}Data`]: data,
              }))
            }
          } catch (error) {
            console.error(`Failed to load data for page ${page} from IndexedDB:`, error)
          }
        }
      },
    }),
    {
      name: 'data-explorer-storage',
      partialize: (state) => {
        // Helper function to store only metadata, not the full data
        const getMetadataOnly = (parsedData: ParsedData | null) => {
          if (!parsedData) return null
          return {
            ...parsedData,
            data: null, // Don't store the actual data in localStorage
            _hasDataInIndexedDB: true // Flag to indicate data is in IndexedDB
          }
        }

        return {
          // Only store metadata in localStorage, actual data goes to IndexedDB
          googleMapsTimelineData: getMetadataOnly(state.googleMapsTimelineData),
          browserHistoryData: getMetadataOnly(state.browserHistoryData),
          youtubeHistoryData: getMetadataOnly(state.youtubeHistoryData),
          playstoreAppsData: getMetadataOnly(state.playstoreAppsData),
          fitbitData: getMetadataOnly(state.fitbitData),
          googleMapReviewsData: getMetadataOnly(state.googleMapReviewsData),
          deviceInfoData: getMetadataOnly(state.deviceInfoData),
          debugJsonData: getMetadataOnly(state.debugJsonData)
        }
      },
      onRehydrateStorage: () => (state) => {
        // After rehydrating from localStorage, load actual data from IndexedDB
        if (state) {
          state.initializeFromDB()
        }
      }
    }
  )
)