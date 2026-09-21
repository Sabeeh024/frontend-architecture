import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A SEPARATE build of the SAME app: one file (`widget.js`), bundling its own
// React, exporting `mount(container)`. This is what gets deployed
// independently and loaded at runtime by another app (see
// shared/remotes/AdminModerationWidget.jsx in apps/devlog) — no shared
// dev server, no build-time dependency between the two apps.
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    lib: {
      entry: 'src/widget-entry.jsx',
      formats: ['es'],
      fileName: () => 'widget.js',
    },
    cssCodeSplit: false,
  },
})
