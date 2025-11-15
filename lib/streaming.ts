/**
 * Streaming platform selection logic
 *
 * Centralized system for:
 * - Mapping normalized networks to streaming platforms
 * - Building all available options for each game
 * - Selecting the "best" platform based on availability + user preferences
 */

import type {
  StreamingPlatformId,
  StreamingOption,
  UserStreamingPrefs,
} from './streaming-types';

/**
 * Map a normalized network name to its StreamingPlatformId
 */
function mapNormalizedNetworkToPlatformId(
  normalized: string
): StreamingPlatformId | null {
  switch (normalized) {
    case 'ESPN':
    case 'ESPN2':
      return 'espn';
    case 'ABC':
      return 'abc';
    case 'NBC':
      return 'nbc';
    case 'Peacock':
      return 'peacock';
    case 'Prime Video':
      return 'prime_video';
    case 'NBA TV':
      return 'nba_tv';
    default:
      return null;
  }
}

/**
 * Create a StreamingOption for a given platform
 */
function makeOptionForPlatform(
  id: StreamingPlatformId,
  label: string,
  espnGameId: string
): StreamingOption {
  switch (id) {
    case 'espn':
      return {
        id,
        label: 'ESPN',
        kind: 'network',
        links: {
          web: `https://www.espn.com/nba/game/_/gameId/${espnGameId}`,
        },
        defaultPriority: 10,
      };
    case 'abc':
      return {
        id,
        label: 'ABC',
        kind: 'network',
        links: {
          web: 'https://abc.com/watch-live',
        },
        defaultPriority: 20,
      };
    case 'nbc':
      return {
        id,
        label: 'NBC',
        kind: 'network',
        links: {
          web: 'https://www.nbc.com/live',
        },
        defaultPriority: 30,
      };
    case 'peacock':
      return {
        id,
        label: 'Peacock',
        kind: 'ott',
        links: {
          web: 'https://www.peacocktv.com/sports/nba',
        },
        defaultPriority: 40,
      };
    case 'prime_video':
      return {
        id,
        label: 'Prime',
        kind: 'ott',
        links: {
          web: 'https://www.amazon.com/gp/video/storefront/ref=atv_nb_live',
        },
        defaultPriority: 50,
      };
    case 'nba_tv':
      return {
        id,
        label: 'NBA TV',
        kind: 'network',
        links: {
          web: 'https://www.nba.com/watch/league-pass-stream',
        },
        defaultPriority: 60,
      };
    case 'league_pass':
      return {
        id,
        label: 'LP',
        kind: 'league_pass',
        links: {
          web: `https://www.nba.com/game/${espnGameId}`,
        },
        defaultPriority: 70,
      };
    case 'info':
    case 'other':
    default:
      return {
        id: 'info',
        label: 'TV info TBD',
        kind: 'info',
        links: {
          web: `https://www.espn.com/nba/game/_/gameId/${espnGameId}`,
        },
        defaultPriority: 999,
      };
  }
}

/**
 * Build streaming options from normalized network names and League Pass flag
 */
export function buildStreamingOptions(
  normalizedNetworks: string[],
  hasLeaguePass: boolean,
  espnGameId: string
): StreamingOption[] {
  const options: StreamingOption[] = [];

  // Add network/OTT streaming options
  for (const net of normalizedNetworks) {
    const id = mapNormalizedNetworkToPlatformId(net);
    if (!id) continue;

    options.push(makeOptionForPlatform(id, net, espnGameId));
  }

  // Add League Pass if available OR if no national networks (most games are on LP)
  // ESPN API flag indicates LP-exclusive, but most games are available on LP
  if (hasLeaguePass || normalizedNetworks.length === 0) {
    options.push(makeOptionForPlatform('league_pass', 'League Pass', espnGameId));
  }

  // Fallback: info-only option if no streams available (should rarely happen)
  if (!options.length) {
    options.push({
      id: 'info',
      label: 'TV info TBD',
      kind: 'info',
      links: {
        web: `https://www.espn.com/nba/game/_/gameId/${espnGameId}`,
      },
      defaultPriority: 999,
    });
  }

  return options;
}

/**
 * Select the primary streaming option based on user preferences and default ordering
 */
export function selectPrimaryOption(
  options: StreamingOption[],
  prefs?: UserStreamingPrefs | null
): StreamingOption {
  if (!options.length) {
    throw new Error('selectPrimaryOption called with empty options');
  }

  // Default order: current NBA broadcast partners (2024-25 season)
  const defaultOrder: StreamingPlatformId[] = [
    'espn',
    'abc',
    'nbc',
    'peacock',
    'prime_video',
    'nba_tv',
    'league_pass',
    'info',
    'other',
  ];

  const order =
    prefs?.preferredOrder?.length ? prefs.preferredOrder : defaultOrder;

  const score = (id: StreamingPlatformId) => {
    const idx = order.indexOf(id);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  return options
    .slice()
    .sort((a, b) => score(a.id) - score(b.id) || a.defaultPriority - b.defaultPriority)[0];
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
      'abc',
      'nbc',
      'peacock',
      'prime_video',
      'nba_tv',
      'league_pass',
      'other',
      'info',
    ],
  };
}
