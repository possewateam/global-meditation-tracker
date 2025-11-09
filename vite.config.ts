import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// Post-build hardening: neutralize unsafe __name reassignments in vendor bundles
function fixNameHelperPlugin() {
  const safeHelper = `globalThis.__name || ((target, value) => { try { Object.defineProperty(target, "name", { value, configurable: true }); } catch {} return target; })`;
  return {
    name: 'fix-name-helper',
    enforce: 'post',
    renderChunk(code: string) {
      let patched = code;
      // Guard "__name = __safeName" patterns
      patched = patched.replace(/\b__name\s*=\s*__safeName\b/g, `__name = (typeof __safeName === "function" ? __safeName : (${safeHelper}))`);
      // Guard "var __name = (typeof __fnName ...)" patterns
      patched = patched.replace(/\bvar\s+__name\s*=\s*\(typeof\s+__fnName[^;]*;?/g, `var __name = (${safeHelper});`);
      if (patched !== code) {
        return { code: patched, map: null };
      }
      return null;
    },
    transform(code: string, id: string) {
      // Apply a light touch for dev transforms on node_modules to avoid side effects
      if (id.includes('node_modules')) {
        let patched = code;
        patched = patched.replace(/\b__name\s*=\s*__safeName\b/g, `__name = (typeof __safeName === "function" ? __safeName : (${safeHelper}))`);
        patched = patched.replace(/\bvar\s+__name\s*=\s*\(typeof\s+__fnName[^;]*;?/g, `var __name = (${safeHelper});`);
        if (patched !== code) {
          return { code: patched, map: null };
        }
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    fixNameHelperPlugin() as any,
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      // Use a local Kapsule implementation to avoid constructor issues in production
      'kapsule': path.resolve(__dirname, 'src/vendor/kapsule/index.js'),
      // Normalize frame-ticker UMD to ESM default via shim to avoid dev import errors
      'frame-ticker/dist/FrameTicker.js': path.resolve(__dirname, 'src/shims/frame-ticker.ts'),
    },
    // Ensure a single copy of three is used to avoid class mismatches
    dedupe: ['three'],
  },
  esbuild: {
    legalComments: 'none',
    // Preserve function/class names to avoid constructor issues in vendor libs
    keepNames: true,
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
      '@supabase/supabase-js',
      // Ensure frame-ticker is pre-bundled to provide ESM default interop
      'frame-ticker',
      // Force pre-bundling of CommonJS prop-types to ensure default export interop in dev
      'prop-types'
    ],
    exclude: [
      // Exclude these from esbuild pre-bundling to avoid constructor/name mangling
      'kapsule',
      'globe.gl',
      'three-globe',
      'react-globe.gl',
    ],
    esbuildOptions: {
      // Keep function/class names during dependency pre-bundling
      keepNames: true,
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    // Use terser and preserve names to avoid runtime issues in vendor code
    minify: 'terser',
    terserOptions: {
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
      compress: {
        keep_fnames: true,
        // Safe compress options
        passes: 2,
        pure_getters: true,
        // Optionally drop console in production; esbuild.drop also handles this
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // Ensure CommonJS modules mixed with ESM are transformed safely
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 1500,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    rollupOptions: {
      // Disable treeshaking to prevent class/prototype mangling in kapsule/globe.gl
      treeshake: false,
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
