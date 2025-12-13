import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFavoritesStore } from './useFavoritesStore';
interface PrivacyState {
  enableLocalStorage: boolean;
  toggleLocalStorage: (enabled: boolean) => void;
  clearAllData: () => void;
}
export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      enableLocalStorage: false,
      toggleLocalStorage: (enabled) => {
        set({ enableLocalStorage: enabled });
        if (!enabled) {
          // If persistence is disabled, clear stored data
          localStorage.removeItem('lv-feed-favorites-storage');
          localStorage.removeItem('theme');
          useFavoritesStore.setState({ favoriteUrls: [] });
          // Optionally force a theme reset to system preference
          document.documentElement.classList.remove('dark', 'light');
        }
      },
      clearAllData: () => {
        // This is a destructive action, clear everything
        localStorage.removeItem('lv-feed-favorites-storage');
        localStorage.removeItem('theme');
        localStorage.removeItem('lv-privacy-settings'); // Also clear privacy settings
        useFavoritesStore.setState({ favoriteUrls: [] });
        set({ enableLocalStorage: false });
        // Reset theme to system preference
        document.documentElement.classList.remove('dark', 'light');
        window.location.reload(); // Reload to apply changes cleanly
      },
    }),
    {
      name: 'lv-privacy-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);