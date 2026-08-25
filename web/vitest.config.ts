import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Keep Vitest focused on unit/integration/QA tests. Browser E2E tests
    // under web/e2e are owned exclusively by Playwright.
    include: ['src/**/*.test.ts', 'src/**/*.qa.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
  },
});
