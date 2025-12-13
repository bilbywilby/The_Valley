import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
interface ShortcutHandlers {
  onSearchFocus: () => void;
  onEditOpen: () => void;
  onToggleFavorites: () => void;
}
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useHotkeys('s', (e) => {
    e.preventDefault();
    handlers.onSearchFocus();
    toast.info('Search focused');
  }, { preventDefault: true });
  useHotkeys('e', (e) => {
    e.preventDefault();
    handlers.onEditOpen();
    toast.info('Edit feeds panel opened');
  }, { preventDefault: true });
  useHotkeys('f', (e) => {
    e.preventDefault();
    handlers.onToggleFavorites();
    toast.info('Toggled favorites filter');
  }, { preventDefault: true });
}