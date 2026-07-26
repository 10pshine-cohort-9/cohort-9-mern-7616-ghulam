import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Material Symbols ship as bare black paths sized 48px. `icon` swaps the
    // dimensions for 1em so glyphs track font-size, and the currentColor fill
    // cascades to the paths, which carry no fill of their own — without it
    // every icon would render black in both themes.
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { fill: 'currentColor' },
      },
    }),
  ],
  server: {
    port: 5173,
    // Fail loudly instead of silently sliding to 5174. The port is documented
    // in the README and the backend will proxy to it, so quiet drift would
    // break CORS in a way that is tedious to trace back to here.
    strictPort: true,
  },
})
