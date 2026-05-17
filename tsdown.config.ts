import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/route-handler.ts', 'src/actions.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
  platform: 'neutral',
  deps: {
    neverBundle: [
      'node:crypto',
      'next',
      'next/headers',
      'server-only',
      'przelewy24-ts-sdk',
      'przelewy24-ts-sdk/webhooks',
    ],
  },
  sourcemap: true,
});
