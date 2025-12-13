import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { categorizedFeeds, Feed } from '@/data/feeds';
interface FavoritesState {
  favoriteUrls: string[];
  toggleFavorite: (url: string) => void;
  isFavorite: (url: string) => boolean;
  getFavoriteFeeds: () => Feed[];
}
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'lv-feed-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);