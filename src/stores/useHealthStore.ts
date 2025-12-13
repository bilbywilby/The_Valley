import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { usePrivacyStore } from './usePrivacyStore';
export type HealthStatus = 'ok' | 'error' | 'loading' | 'unknown';
interface HealthState {
  statuses: Record<string, { status: HealthStatus; timestamp: number }>;
  isChecking: boolean;
  checkHealth: (urls: string[]) => Promise<void>;
  getStatus: (url: string) => HealthStatus;
}
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      statuses: {},
      isChecking: false,
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
          const { statuses: newStatuses } = await response.json<{ statuses: Record<string, 'ok' | 'error'> }>();
          const updatedStatuses = Object.entries(newStatuses).reduce((acc, [url, status]) => {
            acc[url] = { status, timestamp: now };
            return acc;
          }, {} as Record<string, { status: HealthStatus; timestamp: number }>);
          set(state => ({ statuses: { ...state.statuses, ...updatedStatuses } }));
        } catch (error) {
          console.error("Health check failed:", error);
          // Revert loading states to unknown on error
          const revertedStatuses = urls.reduce((acc, url) => {
            acc[url] = { status: 'unknown', timestamp: now };
            return acc;
          }, {} as Record<string, { status: HealthStatus; timestamp: number }>);
          set(state => ({ statuses: { ...state.statuses, ...revertedStatuses } }));
        } finally {
          set({ isChecking: false });
        }
      },
    }),
    {
      name: 'lv-health-status-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
usePrivacyStore.subscribe(
  (state, prevState) => {
    if (state.enableLocalStorage && !prevState.enableLocalStorage) {
      useHealthStore.persist.rehydrate();
    }
  }
);