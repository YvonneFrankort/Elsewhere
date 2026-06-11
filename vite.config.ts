import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // ← exposes Vite to the emulator
    strictPort: true   // ← keeps the port stable
  }
})
