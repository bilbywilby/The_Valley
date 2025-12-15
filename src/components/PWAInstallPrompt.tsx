import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
export function PWAInstallPrompt() {
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
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App installed successfully! Feeds are cached for offline use.');
    } else {
      toast.info('Installation dismissed.');
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);
  if (!deferredPrompt) {
    return null;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={handleInstallClick}
        variant="outline"
        size="lg"
        className="font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/50"
      >
        <DownloadCloud className="mr-2 h-5 w-5" />
        Install App
      </Button>
    </motion.div>
  );
}