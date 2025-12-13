import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
interface ShortcutHandlers {
  onSearchFocus: () => void;
  onEditOpen: () => void;
  onToggleFavorites: () => void;
}
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  // Keep a mutable reference to the latest handlers so the event listener
  // always calls the current callbacks without needing to re‑attach.
  const handlersRef = useRef<ShortcutHandlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when focus is on form fields.
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, select')) return;

      // Only react to plain key presses (no modifier keys).
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === 's') {
        e.preventDefault();
        handlersRef.current.onSearchFocus();
        toast.info('Search focused');
      } else if (key === 'e') {
        e.preventDefault();
        handlersRef.current.onEditOpen();
        toast.info('Edit feeds panel opened');
      } else if (key === 'f') {
        e.preventDefault();
        handlersRef.current.onToggleFavorites();
        toast.info('Toggled favorites filter');
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []); // Attach listener once on mount.
}