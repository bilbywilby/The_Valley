import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PrivacyState {
  storageMode: 'session' | 'local';
  healthChecksEnabled: boolean;
  toggleStorageMode: () => void;
  toggleHealthChecks: (enabled: boolean) => void;
  clearAllData: () => void;
}
export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      storageMode: 'session',
      healthChecksEnabled: false,
      toggleStorageMode: () => {
        const newMode = get().storageMode === 'session' ? 'local' : 'session';
        set({ storageMode: newMode });
        // When switching, we might want to migrate data or clear the old one.
        // For simplicity, we'll let the app re-hydrate from the new source on next load.
      },
      toggleHealthChecks: (enabled) => {
        set({ healthChecksEnabled: enabled });
        if (!enabled) {
          const HEALTH_STORAGE_KEY = 'lv-health-status-storage';
          localStorage.removeItem(HEALTH_STORAGE_KEY);
          sessionStorage.removeItem(HEALTH_STORAGE_KEY);
        }
      },
      clearAllData: () => {
        // This is a destructive action, clear everything from both storages
        localStorage.clear();
        sessionStorage.clear();
        set({ storageMode: 'session', healthChecksEnabled: false });
        // Reset all stores to their initial state

        // Reload to reset feeds store and apply theme changes cleanly
        window.location.reload();
      },
    }),
    {
      name: 'lv-privacy-settings', // This one always persists to localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);