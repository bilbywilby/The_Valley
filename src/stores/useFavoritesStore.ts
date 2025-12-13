import { create } from 'zustand';
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