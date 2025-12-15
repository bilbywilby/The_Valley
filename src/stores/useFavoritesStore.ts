import { create } from 'zustand';
<<<<<<< HEAD
import { persist, createJSONStorage } from 'zustand/middleware';
import { categorizedFeeds, Feed } from '@/data/feeds';
interface FavoritesState {
  favoriteUrls: string[];
  /** Whether the UI should filter to only show favorite feeds */
  filterFavorites: boolean;
  /** Toggle a feed URL in the favorites list */
  toggleFavorite: (url: string) => void;
  /** Set the filter‑favorites flag */
  setFilterFavorites: (enabled: boolean) => void;
  /** Toggle the filter‑favorites flag */
  toggleFilterFavorites: () => void;
  /** Return true if a URL is in the favorites list */
  isFavorite: (url: string) => boolean;
  /** Number of favorite URLs – useful as a stable selector */
  favoritesCount: () => number;
  /** Get the full Feed objects that are favorited */
  getFavoriteFeeds: () => Feed[];
}
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteUrls: [],
filterFavorites: false,
toggleFavorite: (url) =>
  set((state) => {
    const isFavorite = state.favoriteUrls.includes(url);
    if (isFavorite) {
      return { favoriteUrls: state.favoriteUrls.filter((favUrl) => favUrl !== url) };
    } else {
      return { favoriteUrls: [...state.favoriteUrls, url] };
    }
  }),

// New action: explicitly set the filter flag
setFilterFavorites: (enabled) => set({ filterFavorites: enabled }),

// New action: toggle the filter flag
toggleFilterFavorites: () => set((state) => ({ filterFavorites: !state.filterFavorites })),

isFavorite: (url) => get().favoriteUrls.includes(url),

// New getter: stable count of favorites
favoritesCount: () => get().favoriteUrls.length,

getFavoriteFeeds: () => {
  const allFeeds = Object.values(categorizedFeeds).flat();
  const favoriteUrlsSet = new Set(get().favoriteUrls);
  return allFeeds.filter(feed => favoriteUrlsSet.has(feed.url));
},
    }),
    {
      name: 'lv-feed-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
=======
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
>>>>>>> 0d26976410944c8e5b4190917084a1a22d1fee10
