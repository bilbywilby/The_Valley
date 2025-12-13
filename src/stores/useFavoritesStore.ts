import { create } from 'zustand';
import { categorizedFeeds, Feed } from '@/data/feeds';
interface FavoritesState {
  favoriteUrls: string[];
  toggleFavorite: (url: string) => void;
  isFavorite: (url: string) => boolean;
  getFavoriteFeeds: () => Feed[];
  loadFromStorage: () => void;
}
export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteUrls: [],
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
    const allFeeds = Object.values(categorizedFeeds).flat();
    const favoriteUrlsSet = new Set(get().favoriteUrls);
    return allFeeds.filter(feed => favoriteUrlsSet.has(feed.url));
  },
  loadFromStorage: () => {
    try {
      const item = localStorage.getItem('lv-feed-favorites-storage');
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.state && Array.isArray(parsed.state.favoriteUrls)) {
          set({ favoriteUrls: parsed.state.favoriteUrls });
        }
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    }
  },
}));