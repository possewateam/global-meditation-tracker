import { StrictMode } from 'react';
// Namespace import for runtime guard to expose global React
import * as ReactNS from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as THREE from 'three';

// Ensure vendor bundles relying on a global THREE reference work correctly
// Some third-party modules check window.THREE and expect constructors like Mesh/Group
// Setting this avoids runtime errors like "Super expression must either be null or a function"
// when extending classes from THREE via global access.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).THREE = THREE;
  // Ensure third-party bundles that read global React find it
  // Some vendor shims access React at module top-level (e.g., useSyncExternalStore shim)
  // Provide a global reference to avoid circular import evaluation crashes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).React = (window as any).React || ReactNS;

  // Provide global __name helper if missing (used by compiled vendor chunks)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).__name) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__name = (target: Function, value: string) => {
      try {
        Object.defineProperty(target, 'name', { value, configurable: true });
      } catch {
        // ignore
      }
      return target;
    };
  }

  // Provide a safe performance.now fallback for timing code
  if (typeof performance === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).performance = {};
  }
  if (typeof performance.now !== 'function') {
    performance.now = () => Date.now();
  }
}

if (import.meta.env.DEV) {
  console.log('[Main] Starting application initialization');
  console.log('[Main] Environment:', {
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    mode: import.meta.env.MODE,
  });
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('[Main] Missing Supabase environment variables');
  console.error('[Main] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
  console.error('[Main] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (import.meta.env.DEV) {
            console.log('[Main] Service Worker registered:', registration);
          }
        })
        .catch((error) => {
          console.warn('[Main] Service Worker registration failed:', error);
        });
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {});
    });
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  if (import.meta.env.DEV) {
    console.error('[Main] Root element not found in DOM');
  }
  throw new Error('Root element not found');
}

if (import.meta.env.DEV) {
  console.log('[Main] Root element found, rendering application');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );
  if (import.meta.env.DEV) {
    console.log('[Main] Application rendered successfully');
  }
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('[Main] Error rendering application:', error);
  }
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #1e3a8a, #134e4a, #065f46); color: white; padding: 20px;">
      <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; max-width: 500px;">
        <h1 style="font-size: 24px; margin-bottom: 15px;">Failed to Load Application</h1>
        <p style="margin-bottom: 15px;">The application encountered an error during initialization.</p>
        <button onclick="window.location.reload()" style="background: #14b8a6; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
