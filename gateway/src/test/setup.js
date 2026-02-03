import { beforeAll, afterAll, vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.GATEWAY_PORT = '4001';
process.env.POCKETBASE_URL = 'http://localhost:8090';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars';
process.env.GATEWAY_CORS_ORIGINS = 'http://localhost:5173';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn((...args) => {
    // Still log errors that aren't expected test errors
    if (args[0] && !args[0].includes('[Gateway Error]')) {
      originalConsoleError(...args);
    }
  });
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
