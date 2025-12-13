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
import { ShieldCheck, Trash2 } from 'lucide-react';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
interface PrivacySettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function PrivacySettingsSheet({ open, onOpenChange }: PrivacySettingsSheetProps) {
  const enableLocalStorage = usePrivacyStore((state) => state.enableLocalStorage);
  const toggleLocalStorage = usePrivacyStore((state) => state.toggleLocalStorage);
  const clearAllData = usePrivacyStore((state) => state.clearAllData);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Privacy & Data Settings
          </SheetTitle>
          <SheetDescription>
            This application runs entirely in your browser. No data is sent to any server.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow py-4 space-y-6">
          <div className="p-4 border rounded-lg bg-background">
            <div className="flex items-center justify-between">
              <Label htmlFor="local-storage-switch" className="font-semibold text-base">
                Enable Local Storage
              </Label>
              <Switch
                id="local-storage-switch"
                checked={enableLocalStorage}
                onCheckedChange={toggleLocalStorage}
                aria-label="Toggle local storage persistence"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Turn this on to save your favorite feeds and theme preference between visits. When off, all settings are reset when you close the tab.
            </p>
          </div>
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
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
                            This will permanently delete all your saved favorites and theme settings from your browser. This action cannot be undone.
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
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" className="w-full">Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}