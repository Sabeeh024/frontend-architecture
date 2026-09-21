import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Topic 18: `base` matches the path devlog's dev-server proxy mounts this
// app under (`/admin`), so every asset URL Vite emits resolves correctly
// once a request arrives here already prefixed. Standalone (`npm run dev`
// straight on :5174) still works — Vite serves index.html at `/admin/` too.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
})
