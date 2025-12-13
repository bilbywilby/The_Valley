import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFavoritesStore } from './useFavoritesStore';
import { useFeedsStore } from './useFeedsStore';
import { useHealthStore } from './useHealthStore';
interface PrivacyState {
  enableLocalStorage: boolean;
  healthChecksEnabled: boolean;
  toggleLocalStorage: (enabled: boolean) => void;
  toggleHealthChecks: (enabled: boolean) => void;
  clearAllData: () => void;
}
export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      enableLocalStorage: false,
      healthChecksEnabled: false,
      toggleLocalStorage: (enabled) => {
        set({ enableLocalStorage: enabled });
        if (!enabled) {
          // If persistence is disabled, clear stored data
          localStorage.removeItem('lv-feed-favorites-storage');
          localStorage.removeItem('lv-feeds-storage');
          localStorage.removeItem('lv-health-status-storage');
          localStorage.removeItem('theme');
          useFavoritesStore.setState({ favoriteUrls: [], showFavoritesOnly: false });
          // Feeds store will reset on reload.
          document.documentElement.classList.remove('dark', 'light');
        } else {
          // When enabling, hydrate stores
          useFavoritesStore.getState().loadFromStorage();
          useFeedsStore.persist.rehydrate();
          useHealthStore.persist.rehydrate();
        }
      },
      toggleHealthChecks: (enabled) => {
        set({ healthChecksEnabled: enabled });
        if (!enabled) {
          useHealthStore.setState({ statuses: {} });
          localStorage.removeItem('lv-health-status-storage');
        }
      },
      clearAllData: () => {
        // This is a destructive action, clear everything
        localStorage.clear();
        set({ enableLocalStorage: false, healthChecksEnabled: false });
        // Reset all stores to their initial state
        useFavoritesStore.setState({ favoriteUrls: [], showFavoritesOnly: false });
        // Reload to reset feeds store and apply theme changes cleanly
        window.location.reload();
      },
    }),
    {
      name: 'lv-privacy-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);