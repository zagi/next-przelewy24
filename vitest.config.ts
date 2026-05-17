import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // server-only is a runtime marker; in node-only test env we stub it out.
      'server-only': new URL('./tests/server-only-shim.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
