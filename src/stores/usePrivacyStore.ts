import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFavoritesStore } from './useFavoritesStore';
import { useFeedsStore } from './useFeedsStore';
import { useHealthStore } from './useHealthStore';
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
          useHealthStore.setState({ statuses: {} });
          localStorage.removeItem('lv-health-status-storage');
          sessionStorage.removeItem('lv-health-status-storage');
        }
      },
      clearAllData: () => {
        // This is a destructive action, clear everything from both storages
        localStorage.clear();
        sessionStorage.clear();
        set({ storageMode: 'session', healthChecksEnabled: false });
        // Reset all stores to their initial state
        useFavoritesStore.setState({ favoriteUrls: [], showFavoritesOnly: false });
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