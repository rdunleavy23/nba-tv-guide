/**
 * Tests for national network normalization and filtering
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeNetworkName,
  filterToNationalOnly,
  NATIONAL_NETWORKS,
  isNationalNetwork,
} from './national';

describe('normalizeNetworkName', () => {
  it('normalizes NBC variants', () => {
    expect(normalizeNetworkName('nbc')).toBe('NBC');
    expect(normalizeNetworkName('NBC')).toBe('NBC');
    expect(normalizeNetworkName('nbcsn')).toBe('NBC');
  });

  it('normalizes Peacock', () => {
    expect(normalizeNetworkName('peacock')).toBe('Peacock');
    expect(normalizeNetworkName('Peacock')).toBe('Peacock');
    expect(normalizeNetworkName('PEACOCK')).toBe('Peacock');
  });

  it('normalizes Amazon Prime variants to Prime Video', () => {
    expect(normalizeNetworkName('Amazon Prime Video')).toBe('Prime Video');
    expect(normalizeNetworkName('Prime Video')).toBe('Prime Video');
    expect(normalizeNetworkName('prime')).toBe('Prime Video');
    expect(normalizeNetworkName('amazon prime')).toBe('Prime Video');
  });

  it('normalizes ESPN variants', () => {
    expect(normalizeNetworkName('espn')).toBe('ESPN');
    expect(normalizeNetworkName('ESPN')).toBe('ESPN');
    expect(normalizeNetworkName('espn2')).toBe('ESPN2');
    expect(normalizeNetworkName('ESPN2')).toBe('ESPN2');
  });

  it('normalizes NBA TV variants', () => {
    expect(normalizeNetworkName('nba tv')).toBe('NBA TV');
    expect(normalizeNetworkName('NBA TV')).toBe('NBA TV');
    expect(normalizeNetworkName('nbatv')).toBe('NBA TV');
    expect(normalizeNetworkName('nba-tv')).toBe('NBA TV');
  });

  it('returns empty string for invalid/regional networks', () => {
    expect(normalizeNetworkName('Bally Sports')).toBe('');
    expect(normalizeNetworkName('MSG')).toBe('');
    expect(normalizeNetworkName('YES Network')).toBe('');
  });
});

describe('filterToNationalOnly', () => {
  it('keeps only national networks', () => {
    const input = ['ESPN', 'Bally Sports West', 'NBC', 'Amazon Prime Video', 'MSG'];
    const result = filterToNationalOnly(input);
    expect(result).toEqual(['ESPN', 'NBC', 'Prime Video']);
  });

  it('handles mixed case and variants', () => {
    const input = ['espn', 'PEACOCK', 'nba tv', 'Bally Sports'];
    const result = filterToNationalOnly(input);
    expect(result).toEqual(['ESPN', 'Peacock', 'NBA TV']);
  });

  it('returns empty array when no national networks present', () => {
    const input = ['Bally Sports', 'MSG', 'YES Network'];
    const result = filterToNationalOnly(input);
    expect(result).toEqual([]);
  });

  it('does not include removed networks', () => {
    expect(NATIONAL_NETWORKS).not.toContain('TNT');
    expect(NATIONAL_NETWORKS).not.toContain('TruTV');
  });
});

describe('isNationalNetwork', () => {
  it('returns true for national networks', () => {
    expect(isNationalNetwork('ESPN')).toBe(true);
    expect(isNationalNetwork('ABC')).toBe(true);
    expect(isNationalNetwork('NBC')).toBe(true);
    expect(isNationalNetwork('Peacock')).toBe(true);
    expect(isNationalNetwork('Prime Video')).toBe(true);
    expect(isNationalNetwork('NBA TV')).toBe(true);
  });

  it('returns false for regional networks', () => {
    expect(isNationalNetwork('Bally Sports')).toBe(false);
    expect(isNationalNetwork('MSG')).toBe(false);
    expect(isNationalNetwork('YES Network')).toBe(false);
  });

  it('returns false for removed networks', () => {
    expect(isNationalNetwork('TNT')).toBe(false);
    expect(isNationalNetwork('TruTV')).toBe(false);
  });
});

describe('NATIONAL_NETWORKS', () => {
  it('includes all seven current partners', () => {
    expect(NATIONAL_NETWORKS).toContain('ESPN');
    expect(NATIONAL_NETWORKS).toContain('ABC');
    expect(NATIONAL_NETWORKS).toContain('NBC');
    expect(NATIONAL_NETWORKS).toContain('Peacock');
    expect(NATIONAL_NETWORKS).toContain('Prime Video');
    expect(NATIONAL_NETWORKS).toContain('NBA TV');
    // ESPN2 is also included
    expect(NATIONAL_NETWORKS).toContain('ESPN2');
  });

  it('has exactly 7 networks', () => {
    expect(NATIONAL_NETWORKS).toHaveLength(7);
  });
});
