import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline caching, notifications, and background handling
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(swScriptUrl, registration) {
      console.log('[Nur al-Salat] Service Worker registered successfully:', swScriptUrl, registration);
    },
    onRegisterError(error) {
      console.error('[Nur al-Salat] Service Worker registration failed:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
