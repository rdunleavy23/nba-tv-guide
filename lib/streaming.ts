/**
 * Streaming platform types and selection logic
 *
 * This module handles:
 * - All possible ways to watch a game
 * - User preferences for platform ordering
 * - Selection of the "best" platform based on availability + user prefs
 */

export type StreamingPlatformId =
  | 'espn'
  | 'tnt'
  | 'abc'
  | 'nba_tv'
  | 'league_pass'
  | 'prime_video'
  | 'other'
  | 'info'; // "just info, not a stream"

export type StreamingLinkTarget = 'web';
// 'app' can be added later, but browser decides via universal links

export interface StreamingLinkVariants {
  web: string;              // always present - standard HTTPS URL
  iosUniversal?: string;    // optional if it differs
  androidAppLink?: string;  // optional if it differs
}

export interface StreamingOption {
  id: StreamingPlatformId;
  kind: 'network' | 'league_pass' | 'ott' | 'info';
  links: StreamingLinkVariants;
  priority: number; // server-side default priority (lower = better)
  label: string;    // display label: "ESPN", "League Pass", etc.
}

export interface UserStreamingPrefs {
  preferredOrder: StreamingPlatformId[];
  // e.g. ['league_pass', 'espn', 'tnt', 'abc', 'nba_tv', 'info']
  preferLocalTime: boolean; // for timezone
  preferNetworkApps: boolean; // future: tweak within same game
}

/**
 * Select the primary streaming option based on:
 * 1. User preferences (if available)
 * 2. Platform availability
 * 3. Default priority
 */
export function selectPrimaryOption(
  options: StreamingOption[],
  prefs: UserStreamingPrefs | null
): StreamingOption {
  if (!options.length) {
    throw new Error('No streaming options available');
  }

  // Default order: national networks first, then League Pass, then info
  const defaultOrder: StreamingPlatformId[] = [
    'espn',
    'tnt',
    'abc',
    'nba_tv',
    'league_pass',
    'prime_video',
    'other',
    'info',
  ];

  const order = prefs?.preferredOrder ?? defaultOrder;

  // Lower index = better
  const score = (id: StreamingPlatformId) => {
    const i = order.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  // Sort by user preference first, then by server-side priority
  return options
    .slice()
    .sort((a, b) => score(a.id) - score(b.id) || a.priority - b.priority)[0];
}

/**
 * Build streaming options from game data
 */
export function buildStreamingOptions(
  gameId: string,
  networks: string[],
  hasLeaguePass: boolean
): StreamingOption[] {
  const options: StreamingOption[] = [];

  // Add network streaming options
  networks.forEach((network, index) => {
    const normalized = network.toUpperCase();

    if (normalized.includes('ESPN')) {
      options.push({
        id: 'espn',
        kind: 'network',
        links: {
          web: `https://www.espn.com/nba/game/_/gameId/${gameId}`,
        },
        priority: index,
        label: 'ESPN',
      });
    } else if (normalized.includes('TNT')) {
      options.push({
        id: 'tnt',
        kind: 'network',
        links: {
          web: 'https://www.tntdrama.com/watchtnt/east',
        },
        priority: index,
        label: 'TNT',
      });
    } else if (normalized.includes('ABC')) {
      options.push({
        id: 'abc',
        kind: 'network',
        links: {
          web: 'https://abc.com/watch-live',
        },
        priority: index,
        label: 'ABC',
      });
    } else if (normalized.includes('NBA TV')) {
      options.push({
        id: 'nba_tv',
        kind: 'network',
        links: {
          web: 'https://www.nba.com/watch/league-pass-stream',
        },
        priority: index,
        label: 'NBA TV',
      });
    }
  });

  // Add League Pass option if available
  if (hasLeaguePass) {
    options.push({
      id: 'league_pass',
      kind: 'league_pass',
      links: {
        web: `https://www.nba.com/game/${gameId}`,
      },
      priority: networks.length, // After all networks
      label: 'League Pass',
    });
  }

  // Fallback: info-only (ESPN game page)
  if (options.length === 0) {
    options.push({
      id: 'info',
      kind: 'info',
      links: {
        web: `https://www.espn.com/nba/game/_/gameId/${gameId}`,
      },
      priority: 999,
      label: 'TV info TBD',
    });
  }

  return options;
}

/**
 * Get user streaming preferences from localStorage
 */
export function getUserPreferences(): UserStreamingPrefs | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('sa_streaming_prefs');
    if (!stored) return null;

    return JSON.parse(stored) as UserStreamingPrefs;
  } catch {
    return null;
  }
}

/**
 * Save user streaming preferences to localStorage
 */
export function saveUserPreferences(prefs: UserStreamingPrefs): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('sa_streaming_prefs', JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save streaming preferences:', error);
  }
}

/**
 * Get default user preferences
 */
export function getDefaultPreferences(): UserStreamingPrefs {
  return {
    preferredOrder: [
      'espn',
      'tnt',
      'abc',
      'nba_tv',
      'league_pass',
      'prime_video',
      'other',
      'info',
    ],
    preferLocalTime: false,
    preferNetworkApps: false,
  };
}
