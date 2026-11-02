import { useEffect } from 'react';
import { AppView } from '../components/Navbar';

export interface ShortcutHandlers {
  onNavigate: (view: AppView) => void;
  onSave: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleChat: () => void;
  onTogglePalette: () => void;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Escape always closes open overlays
      if (e.key === 'Escape') {
        handlers.onCloseModals();
        return;
      }

      // Command Palette: Ctrl+K or Cmd+K
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onTogglePalette();
        return;
      }

      // Help Modal: '?' pressed when not typing in an input
      if (!isInput && e.key === '?') {
        e.preventDefault();
        handlers.onTogglePalette();
        return;
      }

      // Save: Ctrl+S or Cmd+S
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlers.onSave();
        return;
      }

      // Toggle Gemini Chatbot: Ctrl+J or Cmd+J
      if (mod && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handlers.onToggleChat();
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (when not in a text input)
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (!isInput && handlers.onUndo) {
          e.preventDefault();
          handlers.onUndo();
          return;
        }
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        if (!isInput && handlers.onRedo) {
          e.preventDefault();
          handlers.onRedo();
          return;
        }
      }

      // Navigation shortcuts (Modifier + Key)
      if (mod) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            handlers.onNavigate('dashboard');
            break;
          case 'u':
            e.preventDefault();
            handlers.onNavigate('upload');
            break;
          case 'e':
            e.preventDefault();
            handlers.onNavigate('explorer');
            break;
        }
      }

      // Alt-based navigation shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            e.preventDefault();
            handlers.onNavigate('cleaning');
            break;
          case 'a':
            e.preventDefault();
            handlers.onNavigate('analytics');
            break;
          case 'v':
            e.preventDefault();
            handlers.onNavigate('visualizations');
            break;
          case 'r':
            e.preventDefault();
            handlers.onNavigate('report-builder');
            break;
          case 'i':
            e.preventDefault();
            handlers.onNavigate('ai-insights');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
