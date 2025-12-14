import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/alert-dialog";
import { ShieldCheck, Trash2, Activity } from "lucide-react";
import { usePrivacyStore } from "@/stores/usePrivacyStore";
import { motion } from "framer-motion";
interface PrivacySettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
/**
 * PrivacySettingsSheet
 *
 * A sheet that lets users toggle persistent storage, enable feed health checks,
 * and clear all saved data. The sheet content animates with a slide‑up & scale
 * entrance, while each toggle section animates with a staggered fade‑in.
 */
export function PrivacySettingsSheet({
  open,
  onOpenChange,
}: PrivacySettingsSheetProps) {
  const storageMode = usePrivacyStore((state) => state.storageMode);
  const toggleStorageMode = usePrivacyStore((state) => state.toggleStorageMode);
  const healthChecksEnabled = usePrivacyStore((state) => state.healthChecksEnabled);
  const toggleHealthChecks = usePrivacyStore((state) => state.toggleHealthChecks);
  const clearAllData = usePrivacyStore((state) => state.clearAllData);
  // Container for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  // Individual item animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  // Slide‑up & scale for the whole sheet body
  const slideUpScaleVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1 },
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* SheetContent must keep its original className for layout */}
      <SheetContent className="overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Privacy &amp; Data Settings
          </SheetTitle>
          <SheetDescription>
            This application runs entirely in your browser. No data is sent to any
            server unless you opt‑in to specific features.
          </SheetDescription>
        </SheetHeader>
        {/* Main animated container */}
        <motion.div
          className="flex-1 overflow-hidden flex flex-col py-4"
          variants={slideUpScaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Staggered toggle sections */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Persistent storage toggle */}
            <motion.div variants={itemVariants} className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="persistent-storage-switch"
                  className="font-semibold text-base"
                >
                  Enable Persistent Storage
                </Label>
                <Switch
                  id="persistent-storage-switch"
                  checked={storageMode === "local"}
                  onCheckedChange={toggleStorageMode}
                  aria-label="Toggle persistent storage"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Default is session storage (clears when tab closes). Turn this on
                to save favorites and custom feeds across browser sessions.
              </p>
            </motion.div>
            {/* Feed health checks toggle */}
            <motion.div variants={itemVariants} className="p-4 border rounded-lg bg-background">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="health-check-switch"
                  className="font-semibold text-base flex items-center gap-2"
                >
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
                Opt‑in to allow the app to check if feed URLs are active. This
                sends URLs to a privacy‑respecting Cloudflare Worker. Statuses
                are cached in your browser.
              </p>
            </motion.div>
            {/* Clear all data section */}
            <motion.div
              variants={itemVariants}
              className="p-4 border border-destructive/50 rounded-lg bg-destructive/5"
            >
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
                        This will permanently delete all your saved favorites,
                        custom feeds, and theme settings from your browser. This
                        action cannot be undone.
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
                This will remove all application data from your browser,
                including your favorites and privacy settings, and reload the
                page.
              </p>
            </motion.div>
          </motion.div>
          {/* Footer with Done button */}
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" className="w-full">
                Done
              </Button>
            </SheetClose>
          </SheetFooter>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}