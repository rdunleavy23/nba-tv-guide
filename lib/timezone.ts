/**
 * Time formatting utilities for NBA Tonight
 * Handles 12-hour format for US, odd offsets for international, no timezone abbreviations
 * 
 * ROOT CAUSE ANALYSIS:
 * ===================
 * 
 * Problem: App showed "No games tonight" even when games existed.
 * 
 * Root Cause: Timezone mismatch between date fetching and filtering
 * - ESPN API was called with UTC date: new Date().toISOString().split('T')[0]
 * - Filter checked games in Eastern Time: isGameTonight(gameTimeUtc, 'America/New_York')
 * - When it's late evening in ET (e.g., 11 PM ET on Nov 14), it's already Nov 15 in UTC
 * - API fetched games for Nov 15 (UTC), but filter looked for Nov 14 (ET)
 * - Result: No games found even when games exist
 * 
 * Assumption (WRONG): Server UTC date = User's "tonight" in Eastern Time
 * - This assumption fails during late evening hours when dates differ
 * - Also fails for users in other timezones viewing "tonight" games
 * 
 * Solution: Always use Eastern Time for date calculations
 * - ESPN API dates must be in ET (NBA's primary timezone)
 * - All date comparisons use ET consistently
 * - Simple date string comparison (YYYY-MM-DD) is reliable and correct
 * 
 * Edge Cases Handled:
 * - Day boundaries (late evening ET = next day UTC)
 * - DST transitions (Intl.DateTimeFormat handles automatically)
 * - Different days (not just "today") via getDateForEspnApi()
 */

/**
 * Format game time to local timezone
 * Always localizes to user TZ, 12-hour format for US, handles half-hour/odd offsets
 * Never shows timezone abbreviations (keep terse)
 */
export function formatGameTime(
  utcTimeString: string, 
  timezone: string = 'America/New_York',
  hour12: boolean = true
): string {
  try {
    const date = new Date(utcTimeString);
    
    if (isNaN(date.getTime())) {
      return 'TBD';
    }
    
    // Use user's detected timezone if available, fallback to provided timezone
    const userTimezone = typeof window !== 'undefined' 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : timezone;
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: hour12,
    };
    
    return date.toLocaleTimeString('en-US', options);
  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'TBD';
  }
}

/**
 * Get today's date string in the specified timezone (YYYY-MM-DD format)
 */
function getTodayInTimezone(timezone: string = 'America/New_York'): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

/**
 * Get today's date string in the specified timezone for ESPN API (YYYYMMDD format)
 */
export function getTodayForEspnApi(timezone: string = 'America/New_York'): string {
  const today = getTodayInTimezone(timezone);
  return today.replace(/-/g, '');
}

/**
 * Convert any date to ESPN API format (YYYYMMDD) in the specified timezone
 * Works for any date, not just today - ensures all days work correctly
 */
export function getDateForEspnApi(date: Date, timezone: string = 'America/New_York'): string {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
  return dateStr.replace(/-/g, '');
}

/**
 * Check if a game time falls on a specific date in the specified timezone
 * More flexible than isGameTonight - works for any date
 */
export function isGameOnDate(
  gameTimeUtc: string,
  targetDate: Date,
  timezone: string = 'America/New_York'
): boolean {
  try {
    const targetDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(targetDate);
    const gameDateInTZ = getDateInTimezone(gameTimeUtc, timezone);
    return targetDateStr === gameDateInTZ;
  } catch (error) {
    console.warn('Error checking if game is on date:', error);
    return false;
  }
}

/**
 * Get the date string for a UTC time in the specified timezone (YYYY-MM-DD format)
 */
function getDateInTimezone(utcTimeString: string, timezone: string = 'America/New_York'): string {
  const date = new Date(utcTimeString);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Check if a game time falls on today's date in the specified timezone
 * Uses simple date string comparison - correct and reliable
 */
export function isGameTonight(
  gameTimeUtc: string, 
  timezone: string = 'America/New_York'
): boolean {
  try {
    const todayInTZ = getTodayInTimezone(timezone);
    const gameDateInTZ = getDateInTimezone(gameTimeUtc, timezone);
    return todayInTZ === gameDateInTZ;
  } catch (error) {
    console.warn('Error checking if game is tonight:', error);
    return false;
  }
}

/**
 * Get local weekday + date string (e.g., "Tue, Oct 21")
 */
export function getLocalDateString(timezone: string = 'America/New_York'): string {
  const now = new Date();
  
  // Use user's detected timezone if available, fallback to provided timezone
  const userTimezone = typeof window !== 'undefined' 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : timezone;
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
  };
  
  return now.toLocaleDateString('en-US', options);
}