import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { categorizedFeeds as initialFeedsData, Feed } from '@/data/feeds';
import { usePrivacyStore } from './usePrivacyStore';
export interface FeedCategory {
  category: string;
  feeds: Feed[];
}
interface FeedsState {
  categorizedFeeds: Record<string, Feed[]>;
  addCategory: (categoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  editCategory: (oldName: string, newName: string) => void;
  addFeed: (categoryName: string, feed: Feed) => void;
  editFeed: (categoryName: string, oldUrl: string, newFeed: Feed) => void;
  deleteFeed: (categoryName: string, url: string) => void;
  getFlatFeeds: () => Feed[];
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  reorderFeeds: (categoryName: string, fromIndex: number, toIndex: number) => void;
}
export const useFeedsStore = create<FeedsState>()(
  persist(
    (set, get) => ({
      categorizedFeeds: initialFeedsData,
      addCategory: (categoryName) => {
        if (!categoryName.trim()) return;
        set((state) => {
          if (state.categorizedFeeds[categoryName]) return state; // Already exists
          return {
            categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: [] },
          };
        });
      },
      deleteCategory: (categoryName) => {
        set((state) => {
          const newFeeds = { ...state.categorizedFeeds };
          delete newFeeds[categoryName];
          return { categorizedFeeds: newFeeds };
        });
      },
      editCategory: (oldName, newName) => {
        if (!newName.trim() || oldName === newName) return;
        set((state) => {
          if (state.categorizedFeeds[newName]) return state; // New name already exists
          const newFeeds = { ...state.categorizedFeeds };
          const feeds = newFeeds[oldName];
          delete newFeeds[oldName];
          newFeeds[newName] = feeds;
          return { categorizedFeeds: newFeeds };
        });
      },
      addFeed: (categoryName, feed) => {
        set((state) => {
          if (!state.categorizedFeeds[categoryName]) return state;
          const categoryFeeds = [...state.categorizedFeeds[categoryName], feed];
          return {
            categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds },
          };
        });
      },
      editFeed: (categoryName, oldUrl, newFeed) => {
        set((state) => {
          if (!state.categorizedFeeds[categoryName]) return state;
          const categoryFeeds = state.categorizedFeeds[categoryName].map((f) =>
            f.url === oldUrl ? newFeed : f
          );
          return {
            categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds },
          };
        });
      },
      deleteFeed: (categoryName, url) => {
        set((state) => {
          if (!state.categorizedFeeds[categoryName]) return state;
          const categoryFeeds = state.categorizedFeeds[categoryName].filter((f) => f.url !== url);
          return {
            categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds },
          };
        });
      },
      reorderFeeds: (categoryName, fromIndex, toIndex) => {
        set((state) => {
          const category = state.categorizedFeeds[categoryName];
          if (!category) return state;
          const newCategoryFeeds = [...category];
          const [movedItem] = newCategoryFeeds.splice(fromIndex, 1);
          newCategoryFeeds.splice(toIndex, 0, movedItem);
          return {
            categorizedFeeds: {
              ...state.categorizedFeeds,
              [categoryName]: newCategoryFeeds,
            },
          };
        });
      },
      getFlatFeeds: () => Object.values(get().categorizedFeeds).flat(),
      exportData: () => JSON.stringify(get().categorizedFeeds, null, 2),
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          // Basic validation
          if (typeof data === 'object' && data !== null) {
            set({ categorizedFeeds: data });
            return true;
          }
          return false;
        } catch (e) {
          console.error("Failed to import feeds data:", e);
          return false;
        }
      },
    }),
    {
      name: 'lv-feeds-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // We will manually hydrate based on privacy settings
    }
  )
);
// Manual hydration logic, called from HomePage
usePrivacyStore.subscribe(
  (state, prevState) => {
    if (state.enableLocalStorage && !prevState.enableLocalStorage) {
      useFeedsStore.persist.rehydrate();
    }
  }
);