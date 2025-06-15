import { vi } from 'vitest'

// Mock IndexedDB
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  },
})

// Mock Worker
Object.defineProperty(window, 'Worker', {
  value: class MockWorker {
    constructor(public url: string) {}
    postMessage = vi.fn()
    terminate = vi.fn()
    addEventListener = vi.fn()
    removeEventListener = vi.fn()
  },
})