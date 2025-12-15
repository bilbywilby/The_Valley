import { useState, useEffect } from 'react';
import { usePrivacyStore } from '@/stores/usePrivacyStore';
export function useTheme() {
  const storageMode = usePrivacyStore((state) => state.storageMode);
  const [isDark, setIsDark] = useState(() => {
    if (storageMode === 'local') {
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
      if (storageMode === 'local') {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (storageMode === 'local') {
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark, storageMode]);
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  return { isDark, toggleTheme };
}