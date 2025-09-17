import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          
          'mui-core': ['@mui/material', '@mui/system'],
          'mui-icons': ['@mui/icons-material'],
          'emotion': ['@emotion/react', '@emotion/styled'],
          
          'router': ['react-router-dom'],
          
          'google-maps': [
            '@react-google-maps/api',
            '@vis.gl/react-google-maps'
          ],
          
          'vendor': ['@fontsource/roboto']
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
