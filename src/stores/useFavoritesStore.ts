import { create } from 'zustand';
import { Feed } from '@/data/feeds';
import { useFeedsStore } from './useFeedsStore';
interface FavoritesState {
  favoriteUrls: string[];
  showFavoritesOnly: boolean;
  toggleFavorite: (url: string) => void;
  isFavorite: (url: string) => boolean;
  getFavoriteFeeds: () => Feed[];
  toggleShowFavoritesOnly: () => void;
  loadFromStorage: () => void;
}
export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteUrls: [],
  showFavoritesOnly: false,
  toggleFavorite: (url) =>
    set((state) => {
      const isFavorite = state.favoriteUrls.includes(url);
      if (isFavorite) {
        return { favoriteUrls: state.favoriteUrls.filter((favUrl) => favUrl !== url) };
      } else {
        return { favoriteUrls: [...state.favoriteUrls, url] };
      }
    }),
  isFavorite: (url) => get().favoriteUrls.includes(url),
  getFavoriteFeeds: () => {
    const allFeeds = useFeedsStore.getState().getFlatFeeds();
    const favoriteUrlsSet = new Set(get().favoriteUrls);
    return allFeeds.filter(feed => favoriteUrlsSet.has(feed.url));
  },
  toggleShowFavoritesOnly: () => set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),
  loadFromStorage: () => {
    try {
      const item = localStorage.getItem('lv-feed-favorites-storage');
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
      console.error("Failed to load favorites from localStorage", error);
    }
  },
}));