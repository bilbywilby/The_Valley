import { create } from 'zustand';
import { categorizedFeeds as initialFeedsData, Feed } from '@/data/feeds';
import { usePrivacyStore } from './usePrivacyStore';
export type { Feed } from '@/data/feeds';
const FEEDS_STORAGE_KEY = 'lv-feeds-storage';
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
  saveToStorage: () => void;
  loadFromStorage: () => void;
}
export const useFeedsStore = create<FeedsState>()((set, get) => ({
  categorizedFeeds: initialFeedsData,
  saveToStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      storage.setItem(FEEDS_STORAGE_KEY, JSON.stringify(get().categorizedFeeds));
    } catch (error) {
      console.error("Failed to save feeds to storage", error);
    }
  },
  loadFromStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      const item = storage.getItem(FEEDS_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (typeof parsed === 'object' && parsed !== null) {
          set({ categorizedFeeds: parsed });
        }
      } else {
        // If nothing in storage, load initial data
        set({ categorizedFeeds: initialFeedsData });
      }
    } catch (error) {
      console.error("Failed to load feeds from storage", error);
      set({ categorizedFeeds: initialFeedsData });
    }
  },
  addCategory: (categoryName) => {
    if (!categoryName.trim()) return;
    set((state) => {
      if (state.categorizedFeeds[categoryName]) return state;
      return { categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: [] } };
    });
    get().saveToStorage();
  },
  deleteCategory: (categoryName) => {
    set((state) => {
      const newFeeds = { ...state.categorizedFeeds };
      delete newFeeds[categoryName];
      return { categorizedFeeds: newFeeds };
    });
    get().saveToStorage();
  },
  editCategory: (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    set((state) => {
      if (state.categorizedFeeds[newName]) return state;
      const newFeeds = { ...state.categorizedFeeds };
      const feeds = newFeeds[oldName];
      delete newFeeds[oldName];
      newFeeds[newName] = feeds;
      return { categorizedFeeds: newFeeds };
    });
    get().saveToStorage();
  },
  addFeed: (categoryName, feed) => {
    set((state) => {
      if (!state.categorizedFeeds[categoryName]) return state;
      const categoryFeeds = [...state.categorizedFeeds[categoryName], feed];
      return { categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds } };
    });
    get().saveToStorage();
  },
  editFeed: (categoryName, oldUrl, newFeed) => {
    set((state) => {
      if (!state.categorizedFeeds[categoryName]) return state;
      const categoryFeeds = state.categorizedFeeds[categoryName].map((f) => (f.url === oldUrl ? newFeed : f));
      return { categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds } };
    });
    get().saveToStorage();
  },
  deleteFeed: (categoryName, url) => {
    set((state) => {
      if (!state.categorizedFeeds[categoryName]) return state;
      const categoryFeeds = state.categorizedFeeds[categoryName].filter((f) => f.url !== url);
      return { categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: categoryFeeds } };
    });
    get().saveToStorage();
  },
  reorderFeeds: (categoryName, fromIndex, toIndex) => {
    set((state) => {
      const category = state.categorizedFeeds[categoryName];
      if (!category) return state;
      const newCategoryFeeds = [...category];
      const [movedItem] = newCategoryFeeds.splice(fromIndex, 1);
      newCategoryFeeds.splice(toIndex, 0, movedItem);
      return { categorizedFeeds: { ...state.categorizedFeeds, [categoryName]: newCategoryFeeds } };
    });
    get().saveToStorage();
  },
  getFlatFeeds: () => Object.values(get().categorizedFeeds).flat(),
  exportData: () => JSON.stringify(get().categorizedFeeds, null, 2),
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (typeof data === 'object' && data !== null) {
        set({ categorizedFeeds: data });
        get().saveToStorage();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to import feeds data:", e);
      return false;
    }
  },
}));