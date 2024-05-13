import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules', 'end2end'],
    globals: true,
    environment: 'jsdom',
  },
});
