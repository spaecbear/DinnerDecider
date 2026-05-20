import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// iOS/Capacitor build — no PWA service worker needed
export default defineConfig({
  plugins: [react()],
})
