import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const storageMode = usePrivacyStore(s => s.storageMode);
  useEffect(() => {
    const dismissed = sessionStorage.getItem('privacy-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);
  const handleDismiss = () => {
    sessionStorage.setItem('privacy-banner-dismissed', 'true');
    setIsVisible(false);
  };
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, transition: { duration: 0.2 } }}
          className="mb-8"
        >
          <Card className="p-4 backdrop-blur-sm bg-white/90 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-start sm:items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-indigo-500 flex-shrink-0 mt-1 sm:mt-0" />
              <div className="flex-grow">
                <h3 className="font-semibold text-foreground">Your Privacy Matters</h3>
                <p className="text-sm text-muted-foreground">
                  This app respects your privacy. No tracking is used. All data (favorites, custom feeds) is stored in your browser's <strong>{storageMode === 'local' ? 'persistent' : 'session'}</strong> storage only.
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleDismiss} aria-label="Dismiss privacy notice">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}