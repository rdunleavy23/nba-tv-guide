/**
 * Tests for streaming platform selection logic
 */

import { describe, it, expect } from 'vitest';
import { buildStreamingOptions, selectPrimaryOption } from './streaming';
import type { UserStreamingPrefs } from './streaming-types';

describe('buildStreamingOptions', () => {
  const gameId = '401585000';

  it('creates options for all seven partners', () => {
    const normalizedNetworks = ['ESPN', 'ABC', 'NBC', 'Peacock', 'Prime Video', 'NBA TV'];
    const options = buildStreamingOptions(normalizedNetworks, false, gameId);

    const ids = options.map(o => o.id).sort();
    expect(ids).toEqual([
      'abc',
      'espn',
      'nba_tv',
      'nbc',
      'peacock',
      'prime_video',
    ].sort());
  });

  it('adds league_pass option when available', () => {
    const options = buildStreamingOptions(['ESPN'], true, gameId);
    const ids = options.map(o => o.id);
    expect(ids).toContain('league_pass');
    expect(ids).toContain('espn');
  });

  it('falls back to info-only option when no networks and no league pass', () => {
    const options = buildStreamingOptions([], false, gameId);
    expect(options).toHaveLength(1);
    expect(options[0].id).toBe('info');
    expect(options[0].label).toBe('TV info TBD');
  });

  it('creates options with correct labels', () => {
    const normalizedNetworks = ['Prime Video', 'ESPN'];
    const options = buildStreamingOptions(normalizedNetworks, true, gameId);

    const primeOption = options.find(o => o.id === 'prime_video');
    const espnOption = options.find(o => o.id === 'espn');
    const lpOption = options.find(o => o.id === 'league_pass');

    expect(primeOption?.label).toBe('Prime');
    expect(espnOption?.label).toBe('ESPN');
    expect(lpOption?.label).toBe('LP');
  });

  it('creates options with correct links', () => {
    const normalizedNetworks = ['NBC'];
    const options = buildStreamingOptions(normalizedNetworks, false, gameId);

    const nbcOption = options.find(o => o.id === 'nbc');
    expect(nbcOption?.links.web).toBe('https://www.nbc.com/live');
  });

  it('handles ESPN2 by mapping to ESPN', () => {
    const normalizedNetworks = ['ESPN2'];
    const options = buildStreamingOptions(normalizedNetworks, false, gameId);

    expect(options).toHaveLength(1);
    expect(options[0].id).toBe('espn');
  });

  it('does not create TNT options', () => {
    // This should not create any option since TNT is removed
    const normalizedNetworks = ['TNT'];
    const options = buildStreamingOptions(normalizedNetworks, false, gameId);

    // Should fall back to info
    expect(options).toHaveLength(1);
    expect(options[0].id).toBe('info');
  });
});

describe('selectPrimaryOption', () => {
  const gameId = '401585000';

  it('uses default order when no prefs provided', () => {
    const options = buildStreamingOptions(['Prime Video', 'NBC', 'ESPN'], false, gameId);

    const primary = selectPrimaryOption(options);
    // Default order puts ESPN ahead of NBC and Prime Video
    expect(primary.id).toBe('espn');
  });

  it('uses default order with null prefs', () => {
    const options = buildStreamingOptions(['Prime Video', 'NBC', 'ESPN'], false, gameId);

    const primary = selectPrimaryOption(options, null);
    expect(primary.id).toBe('espn');
  });

  it('respects user preferred order', () => {
    const options = buildStreamingOptions(['Prime Video', 'Peacock', 'ESPN'], true, gameId);

    const prefs: UserStreamingPrefs = {
      preferredOrder: [
        'prime_video',
        'peacock',
        'espn',
        'abc',
        'nbc',
        'nba_tv',
        'league_pass',
        'info',
        'other',
      ],
    };

    const primary = selectPrimaryOption(options, prefs);
    // User prefers Prime Video > Peacock > ESPN
    expect(primary.id).toBe('prime_video');
  });

  it('prefers league_pass when user sets it first', () => {
    const options = buildStreamingOptions(['ESPN', 'ABC'], true, gameId);

    const prefs: UserStreamingPrefs = {
      preferredOrder: [
        'league_pass',
        'espn',
        'abc',
        'nbc',
        'peacock',
        'prime_video',
        'nba_tv',
        'other',
        'info',
      ],
    };

    const primary = selectPrimaryOption(options, prefs);
    expect(primary.id).toBe('league_pass');
  });

  it('falls back to defaultPriority when not in preferred order', () => {
    const options = buildStreamingOptions(['NBC', 'Peacock'], false, gameId);

    const prefs: UserStreamingPrefs = {
      preferredOrder: ['espn'], // Only ESPN in order
    };

    const primary = selectPrimaryOption(options, prefs);
    // Neither NBC nor Peacock is in order, so use defaultPriority
    // NBC has priority 30, Peacock has priority 40
    expect(primary.id).toBe('nbc');
  });

  it('throws error when options array is empty', () => {
    expect(() => selectPrimaryOption([])).toThrow('selectPrimaryOption called with empty options');
  });

  it('returns single option when only one available', () => {
    const options = buildStreamingOptions(['Peacock'], false, gameId);
    const primary = selectPrimaryOption(options);
    expect(primary.id).toBe('peacock');
  });
});

describe('ESPN API mapping', () => {
  it('maps all seven partners correctly', () => {
    const gameId = '401585000';
    const allPartners = ['ESPN', 'ABC', 'NBC', 'Peacock', 'Prime Video', 'NBA TV'];
    const options = buildStreamingOptions(allPartners, true, gameId);

    // Should have 7 options: 6 networks + League Pass
    expect(options).toHaveLength(7);

    const ids = options.map(o => o.id).sort();
    expect(ids).toEqual([
      'abc',
      'espn',
      'league_pass',
      'nba_tv',
      'nbc',
      'peacock',
      'prime_video',
    ].sort());
  });
});
