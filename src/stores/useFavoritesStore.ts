import { create } from 'zustand';
import { Feed } from '@/data/feeds';
import { useFeedsStore } from './useFeedsStore';
import { usePrivacyStore } from './usePrivacyStore';
const FAVORITES_STORAGE_KEY = 'lv-feed-favorites-storage';
interface FavoritesState {
  favoriteUrls: string[];
  showFavoritesOnly: boolean;
  toggleFavorite: (url: string) => void;
  isFavorite: (url: string) => boolean;
  getFavoriteFeeds: () => Feed[];
  toggleShowFavoritesOnly: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteUrls: [],
  showFavoritesOnly: false,
  toggleFavorite: (url) => {
    set((state) => {
      const isFavorite = state.favoriteUrls.includes(url);
      const newFavorites = isFavorite
        ? state.favoriteUrls.filter((favUrl) => favUrl !== url)
        : [...state.favoriteUrls, url];
      return { favoriteUrls: newFavorites };
    });
    get().saveToStorage();
  },
  isFavorite: (url) => get().favoriteUrls.includes(url),
  getFavoriteFeeds: () => {
    const allFeeds = useFeedsStore.getState().getFlatFeeds();
    const favoriteUrlsSet = new Set(get().favoriteUrls);
    return allFeeds.filter(feed => favoriteUrlsSet.has(feed.url));
  },
  toggleShowFavoritesOnly: () => {
    set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly }));
    get().saveToStorage();
  },
  loadFromStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      const item = storage.getItem(FAVORITES_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.state) {
          if (Array.isArray(parsed.state.favoriteUrls)) {
            set({ favoriteUrls: parsed.state.favoriteUrls });
          }
          if (typeof parsed.state.showFavoritesOnly === 'boolean') {
            set({ showFavoritesOnly: parsed.state.showFavoritesOnly });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load favorites from storage", error);
    }
  },
  saveToStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      const stateToSave = {
        version: 0,
        state: {
          favoriteUrls: get().favoriteUrls,
          showFavoritesOnly: get().showFavoritesOnly,
        },
      };
      storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save favorites to storage", error);
    }
  },
}));