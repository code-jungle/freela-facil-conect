import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMode = 
        (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
    };

    // Check if app is already installed
    const checkInstalled = () => {
      // Check for various PWA installation indicators
      const isInstalled = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      
      setIsInstalled(isInstalled);
    };

    checkStandalone();
    checkInstalled();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => {
      checkStandalone();
      checkInstalled();
    };

    mediaQuery.addEventListener('change', handleChange);

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsStandalone(true);
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return {
    isInstalled,
    isStandalone,
    canInstall: !isInstalled && 'serviceWorker' in navigator
  };
};