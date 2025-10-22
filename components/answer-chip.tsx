import { Badge } from '@/components/ui/badge';
import { getNationalNetwork } from '@/lib/national';
import { lpAvailableForUser, getLPStatusText } from '@/lib/blackout';
import { Region } from '@/lib/region';

export interface Game {
  id: string;
  startTimeUtc: string;
  teams: { away: { abbr: string }, home: { abbr: string } };
  networks: string[]; // national only for UI
  allBroadcasts: string[]; // includes RSNs for internal blackout calc
  leaguePass: boolean;
}

interface AnswerChipProps {
  game: Game;
  region: Region | null;
}

/**
 * AnswerChip component - renders exactly ONE chip per game
 * Server component (no client JS)
 * 
 * Logic:
 * 1. Check for national network → render Badge variant="national" with network name
 * 2. Else check LP availability → render appropriate LP status
 * 3. Fallback: if no broadcast data → "TV TBA"
 */
export function AnswerChip({ game, region }: AnswerChipProps) {
  // First priority: Check for national network
  const nationalNetwork = getNationalNetwork(game.networks);
  
  if (nationalNetwork) {
    return (
      <Badge className="h-7 px-2 text-xs font-bold bg-gray-900 text-white border-0 badge-national">
        {nationalNetwork}
      </Badge>
    );
  }
  
  // Second priority: Check LP availability
  if (game.leaguePass) {
    const lpStatus = lpAvailableForUser(region, game);
    
    switch (lpStatus) {
      case 'available':
        return (
          <Badge className="h-7 px-2 text-xs font-semibold bg-emerald-600 text-white badge-lp-available">
            LP ✓
          </Badge>
        );
      case 'blackout':
        return (
          <Badge className="h-7 px-2 text-xs font-medium border-red-500 text-red-500 bg-transparent">
            LP ✕
          </Badge>
        );
      case 'unknown':
      default:
        return (
          <Badge className="h-7 px-2 text-xs font-medium border-muted text-muted-foreground bg-transparent">
            LP ?
          </Badge>
        );
    }
  }
  
  // Fallback: No broadcast data available
  return (
    <Badge className="h-7 px-2 text-xs font-medium border-muted text-muted-foreground bg-transparent">
      TV TBA
    </Badge>
  );
}
