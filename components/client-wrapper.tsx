'use client';

import { useState } from 'react';
import { SettingsSheet } from '@/components/settings-sheet';
import { KeyboardNav } from '@/components/keyboard-nav';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { CommandPalette } from '@/components/command-palette';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleShowShortcuts = () => setIsShortcutsOpen(true);
  const handleFocusNextGame = () => {
    // TODO: Implement game focus navigation
    console.log('Focus next game');
  };
  const handleFocusPrevGame = () => {
    // TODO: Implement game focus navigation
    console.log('Focus prev game');
  };

  const handleFilterByTeam = (team: string) => {
    // TODO: Implement team filtering
    console.log('Filter by team:', team);
  };

  const handleFilterByNetwork = (network: string) => {
    // TODO: Implement network filtering
    console.log('Filter by network:', network);
  };

  const handleClearFilters = () => {
    // TODO: Implement clear filters
    console.log('Clear filters');
  };

  return (
    <>
      {children}
      <KeyboardNav 
        onOpenSettings={handleOpenSettings}
        onShowShortcuts={handleShowShortcuts}
        onFocusNextGame={handleFocusNextGame}
        onFocusPrevGame={handleFocusPrevGame}
      />
      <SettingsSheet 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
      <KeyboardShortcutsDialog 
        open={isShortcutsOpen} 
        onOpenChange={setIsShortcutsOpen} 
      />
      <CommandPalette 
        open={isCommandPaletteOpen} 
        onOpenChange={setIsCommandPaletteOpen}
        games={[]} // TODO: Pass actual games
        onFilterByTeam={handleFilterByTeam}
        onFilterByNetwork={handleFilterByNetwork}
        onClearFilters={handleClearFilters}
      />
    </>
  );
}
