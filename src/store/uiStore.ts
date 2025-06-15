import { create } from 'zustand'

interface UIState {
  currentTab: number
  darkMode: boolean
  sidebarOpen: boolean
  
  // Actions
  setCurrentTab: (tab: number) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  currentTab: 0,
  darkMode: false,
  sidebarOpen: true,

  setCurrentTab: (tab) => set({ currentTab: tab }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))