import { describe, it, expect, vi } from 'vitest';

describe('Environment Configuration', () => {
  it('should validate required environment variables', () => {
    const { env } = vi.mocked(await import('./env'));

    expect(env.VITE_API_URL).toBeDefined();
    expect(env.VITE_POCKETBASE_URL).toBeDefined();
    expect(env.VITE_MAP_TILE_URL).toBeDefined();
    expect(env.VITE_API_KEY).toBeDefined();
  });

  it('should have valid URL formats', () => {
    const { env } = vi.mocked(await import('./env'));

    expect(() => new URL(env.VITE_API_URL)).not.toThrow();
    expect(() => new URL(env.VITE_POCKETBASE_URL)).not.toThrow();
  });

  it('should expose development and production flags', async () => {
    const { isDevelopment, isProduction } = await import('./env');

    expect(typeof isDevelopment).toBe('boolean');
    expect(typeof isProduction).toBe('boolean');
  });
});
