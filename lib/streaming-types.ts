/**
 * Streaming platform types for NBA TV guide
 *
 * Only includes active NBA broadcast partners (2024-25 season):
 * ESPN, ABC, NBC, Peacock, Prime Video, NBA TV, League Pass
 */

export type StreamingPlatformId =
  | 'espn'
  | 'abc'
  | 'nbc'
  | 'peacock'
  | 'prime_video'
  | 'nba_tv'
  | 'league_pass'
  | 'other'
  | 'info';

export interface StreamingLinks {
  web: string; // Primary HTTPS URL - Universal Links handle app routing
}

export type StreamingKind = 'network' | 'ott' | 'league_pass' | 'info';

export interface StreamingOption {
  id: StreamingPlatformId;
  label: string; // Display label: "ESPN", "Prime", "LP", etc.
  kind: StreamingKind;
  links: StreamingLinks;
  defaultPriority: number; // Lower = better for default ordering
  openInNewTab?: boolean; // true for normal websites, false/undefined for deep links
}

export interface UserStreamingPrefs {
  preferredOrder: StreamingPlatformId[];
}
