import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
vi.mock('../config/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:4000',
    VITE_POCKETBASE_URL: 'http://localhost:8090',
    VITE_MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    VITE_API_KEY: 'test-api-key',
    VITE_OSRM_URL: 'http://localhost:5000',
  },
  isDevelopment: true,
  isProduction: false,
}));

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(),
    tileLayer: vi.fn(),
    marker: vi.fn(),
    icon: vi.fn(),
    Icon: {
      Default: {
        prototype: {
          _getIconUrl: vi.fn(),
        },
      },
    },
  },
  map: vi.fn(),
  tileLayer: vi.fn(),
  marker: vi.fn(),
  icon: vi.fn(),
}));

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
