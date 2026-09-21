import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  server: {
    // Topic 18: puts devlog and admin on ONE origin in dev — `/admin` here
    // is proxied straight through to admin's own dev server, transparently
    // to the browser. This is the "same top-level origin" fix topic 17's
    // notes described but didn't build; admin needs `npm run dev` running
    // separately on 5174 for this to resolve. See NOTES/18.
    proxy: {
      '/admin': { target: 'http://localhost:5174', changeOrigin: true, ws: true },
    },
  },
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
