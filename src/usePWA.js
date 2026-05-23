import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Returns install prompt state and update state.
export function usePWA() {
  // ── Install prompt (Add to Home Screen) ─────────────────────────
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled,   setIsInstalled]   = useState(false);

  useEffect(() => {
    // 'beforeinstallprompt' fires when Chrome decides the app is installable
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled',         onAppInstalled);

    // Already running as standalone (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled',         onAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  // ── Service worker update ────────────────────────────────────────
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Проверяем обновления каждые 60 минут
      r && setInterval(() => r.update(), 60 * 60 * 1000);
    },
  });

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    triggerInstall,
    needRefresh,
    updateServiceWorker,
  };
}
