/**
 * Time display settings
 *
 * Server/ESPN logic: Always use ET for date selection ("tonight's games")
 * UI/Client: Show times in user's local timezone by default, with ET override
 */

export type TimeMode = 'local' | 'et';

export interface TimeSettings {
  mode: TimeMode;
  localZone: string | null; // IANA timezone: "America/Chicago", etc.
}

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  mode: 'local',
  localZone: null,
};
