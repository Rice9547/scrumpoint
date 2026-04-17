import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works at any path (GitHub Pages project
// subpath, custom domain, or local preview) without reconfiguration.
export default defineConfig({
  plugins: [react()],
  base: './',
})
