import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn(),
  }
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
  },
  writable: true
})

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  private params: Map<string, string> = new Map()
  
  constructor(search?: string) {
    if (search) {
      const pairs = search.replace('?', '').split('&')
      pairs.forEach(pair => {
        const [key, value] = pair.split('=')
        if (key && value) {
          this.params.set(key, decodeURIComponent(value))
        }
      })
    }
  }
  
  get(key: string) {
    return this.params.get(key)
  }
  
  set(key: string, value: string) {
    this.params.set(key, value)
  }
}

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Clean up after each test case
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
  localStorageMock.clear()
})

// Clean up after all tests are done
afterAll(() => server.close()) 