import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  esbuild: {
    legalComments: 'none',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      'react-globe.gl',
      '@supabase/supabase-js'
    ],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('three') || id.includes('react-globe')) {
              return 'vendor-three';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('country-state-city') || id.includes('world-countries')) {
              return 'vendor-location';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-phone-input')) {
              return 'vendor-phone';
            }
            return 'vendor-other';
          }
          if (id.includes('src/pages/AdminPanel')) {
            return 'page-admin';
          }
        }
      }
    }
  },
});
