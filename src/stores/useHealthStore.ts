import { create } from 'zustand';
import { usePrivacyStore } from './usePrivacyStore';
export type HealthStatus = 'ok' | 'error' | 'loading' | 'unknown';
const HEALTH_STORAGE_KEY = 'lv-health-status-storage';
interface HealthState {
  statuses: Record<string, { status: HealthStatus; timestamp: number }>;
  isChecking: boolean;
  checkHealth: (urls: string[]) => Promise<void>;
  getStatus: (url: string) => HealthStatus;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
export const useHealthStore = create<HealthState>()((set, get) => ({
  statuses: {},
  isChecking: false,
  saveToStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      storage.setItem(HEALTH_STORAGE_KEY, JSON.stringify({ statuses: get().statuses }));
    } catch (error) {
      console.error("Failed to save health status to storage", error);
    }
  },
  loadFromStorage: () => {
    try {
      const { storageMode } = usePrivacyStore.getState();
      const storage = storageMode === 'local' ? localStorage : sessionStorage;
      const item = storage.getItem(HEALTH_STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.statuses) {
          set({ statuses: parsed.statuses });
        }
      }
    } catch (error) {
      console.error("Failed to load health status from storage", error);
    }
  },
  getStatus: (url: string): HealthStatus => {
    const entry = get().statuses[url];
    if (!entry) return 'unknown';
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      return 'unknown'; // Stale
    }
    return entry.status;
  },
  checkHealth: async (urls: string[]) => {
    if (get().isChecking || !usePrivacyStore.getState().healthChecksEnabled) {
      return;
    }
    set({ isChecking: true });
    const now = Date.now();
    const initialStatuses = urls.reduce((acc, url) => {
      acc[url] = { status: 'loading', timestamp: now };
      return acc;
    }, {} as Record<string, { status: HealthStatus; timestamp: number }>);
    set(state => ({ statuses: { ...state.statuses, ...initialStatuses } }));
    try {
      const response = await fetch('/api/rss-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      if (!response.ok) throw new Error('Health check API failed');
      const data = await response.json();
      const newStatuses = data.statuses as Record<string, 'ok' | 'error'>;
      const updatedStatuses = Object.entries(newStatuses).reduce((acc, [url, status]) => {
        if (typeof status === 'string' && (status === 'ok' || status === 'error')) {
          acc[url] = { status: status as HealthStatus, timestamp: now };
        }
        return acc;
      }, {} as Record<string, { status: HealthStatus; timestamp: number }>);
      set(state => ({ statuses: { ...state.statuses, ...updatedStatuses } }));
    } catch (error) {
      console.error("Health check failed:", error);
      const revertedStatuses = urls.reduce((acc, url) => {
        acc[url] = { status: 'unknown', timestamp: now };
        return acc;
      }, {} as Record<string, { status: HealthStatus; timestamp: number }>);
      set(state => ({ statuses: { ...state.statuses, ...revertedStatuses } }));
    } finally {
      set({ isChecking: false });
      get().saveToStorage();
    }
  },
}));