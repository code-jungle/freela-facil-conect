import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton = () => {
  const { isInstalled, canInstall } = usePWA();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    }
    
    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show installation instructions for browsers that support PWA but don't have the prompt yet
  if (!deferredPrompt && canInstall) {
    return (
      <Button
        onClick={() => {
          alert('Para instalar o Servix:\n\n• Chrome/Edge: Clique no ícone de instalação na barra de endereços\n• Safari (iOS): Toque em "Compartilhar" → "Adicionar à Tela de Início"\n• Firefox: Menu → "Instalar este site como app"');
        }}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Briefcase className="w-4 h-4 mr-2" />
        Como Instalar
      </Button>
    );
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      <Briefcase className="w-4 h-4 mr-2" />
      Instalar App
    </Button>
  );
};