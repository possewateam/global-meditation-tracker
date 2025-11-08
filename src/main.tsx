import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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
