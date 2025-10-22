'use client';

import { useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Game } from '@/components/answer-chip';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  games: Game[];
  onFilterByTeam: (team: string) => void;
  onFilterByNetwork: (network: string) => void;
  onClearFilters: () => void;
}

export function CommandPalette({ 
  open, 
  onOpenChange, 
  games, 
  onFilterByTeam, 
  onFilterByNetwork, 
  onClearFilters 
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  // Extract unique teams from games
  const teams = Array.from(new Set(
    games.flatMap(game => [game.teams.away.abbr, game.teams.home.abbr])
  )).sort();

  // Extract unique networks from games
  const networks = Array.from(new Set(
    games.flatMap(game => game.networks)
  )).sort();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Filter games..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Teams">
          {teams.map(team => (
            <CommandItem 
              key={team}
              onSelect={() => {
                onFilterByTeam(team);
                onOpenChange(false);
              }}
            >
              {team}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Networks">
          {networks.map(network => (
            <CommandItem 
              key={network}
              onSelect={() => {
                onFilterByNetwork(network);
                onOpenChange(false);
              }}
            >
              {network} games only
            </CommandItem>
          ))}
          <CommandItem onSelect={() => {
            onFilterByNetwork('National');
            onOpenChange(false);
          }}>
            National TV only
          </CommandItem>
        </CommandGroup>
        
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => {
            onClearFilters();
            onOpenChange(false);
          }}>
            Clear all filters
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
