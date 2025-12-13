import { useState, useEffect } from 'react';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
export function useTheme() {
  const enableLocalStorage = usePrivacyStore((state) => state.storageMode === 'local');
  const [isDark, setIsDark] = useState(() => {
    if (enableLocalStorage) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (enableLocalStorage) {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (enableLocalStorage) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark, enableLocalStorage]);
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  return { isDark, toggleTheme };
}