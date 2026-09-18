import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  test: {
    // happy-dom over jsdom: jsdom ships its own Request/AbortSignal, which
    // Node rejects when react-router's data router builds a navigation Request.
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    restoreMocks: true,
    // formatDate calls Intl -> pin the timezone so date assertions are stable.
    // (locale still comes from the runner; CI is en-US.)
    env: { TZ: 'UTC' },
  },
})
