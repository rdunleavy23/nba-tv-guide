'use client';

import { useEffect } from 'react';

interface KeyboardNavProps {
  onOpenSettings: () => void;
  onShowShortcuts: () => void;
  onFocusNextGame: () => void;
  onFocusPrevGame: () => void;
}

export function KeyboardNav({ 
  onOpenSettings, 
  onShowShortcuts, 
  onFocusNextGame, 
  onFocusPrevGame 
}: KeyboardNavProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + , = Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        onOpenSettings();
      }
      
      // ? = Show keyboard shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onShowShortcuts();
      }
      
      // j/k = Navigate games (Vim-style)
      if (e.key === 'j' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusNextGame();
      }
      if (e.key === 'k' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusPrevGame();
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenSettings, onShowShortcuts, onFocusNextGame, onFocusPrevGame]);
  
  return null;
}
