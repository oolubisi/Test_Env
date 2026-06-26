import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import './index.css'
import App from './App.tsx'

/* ─── PWA Install Prompt ───
   Capture the beforeinstallprompt event so our Install
   button can trigger it later. */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
});

/* ─── Service Worker auto-registration ───
   vite-plugin-pwa handles SW generation; this just
   registers it and notifies the user on updates. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <Router hook={useHashLocation}>
    <App />
  </Router>,
)
