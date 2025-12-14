import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ShieldCheck, Trash2, Activity } from 'lucide-react';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
import { motion } from 'framer-motion';
interface PrivacySettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const MotionSheetContent = motion(SheetContent);
export function PrivacySettingsSheet({ open, onOpenChange }: PrivacySettingsSheetProps) {
  const storageMode = usePrivacyStore((state) => state.storageMode);
  const toggleStorageMode = usePrivacyStore((state) => state.toggleStorageMode);
  const healthChecksEnabled = usePrivacyStore((state) => state.healthChecksEnabled);
  const toggleHealthChecks = usePrivacyStore((state) => state.toggleHealthChecks);
  const clearAllData = usePrivacyStore((state) => state.clearAllData);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <MotionSheetContent
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Privacy & Data Settings
          </SheetTitle>
          <SheetDescription>
            This application runs entirely in your browser. No data is sent to any server unless you opt-in to specific features.
          </SheetDescription>
        </SheetHeader>
        <motion.div
          className="flex-grow py-4 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="p-4 border rounded-lg bg-background">
            <div className="flex items-center justify-between">
              <Label htmlFor="persistent-storage-switch" className="font-semibold text-base">
                Enable Persistent Storage
              </Label>
              <Switch
                id="persistent-storage-switch"
                checked={storageMode === 'local'}
                onCheckedChange={toggleStorageMode}
                aria-label="Toggle persistent storage"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Default is session storage (clears when tab closes). Turn this on to save favorites and custom feeds across browser sessions.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="p-4 border rounded-lg bg-background">
            <div className="flex items-center justify-between">
              <Label htmlFor="health-check-switch" className="font-semibold text-base flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Enable Feed Health Checks
              </Label>
              <Switch
                id="health-check-switch"
                checked={healthChecksEnabled}
                onCheckedChange={toggleHealthChecks}
                aria-label="Toggle feed health checks"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Opt-in to allow the app to check if feed URLs are active. This sends URLs to a privacy-respecting Cloudflare Worker. Statuses are cached in your browser.
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
             <div className="flex items-center justify-between">
                <Label className="font-semibold text-base text-destructive">
                    Clear All Saved Data
                </Label>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all your saved favorites, custom feeds, and theme settings from your browser. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData}>
                            Yes, delete everything
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             </div>
             <p className="text-sm text-destructive/90 mt-2">
                This will remove all application data from your browser, including your favorites and privacy settings, and reload the page.
             </p>
          </motion.div>
        </motion.div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" className="w-full">Done</Button>
          </SheetClose>
        </SheetFooter>
      </MotionSheetContent>
    </Sheet>
  );
}