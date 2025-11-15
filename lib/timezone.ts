/**
 * Time formatting utilities for NBA Tonight
 * Handles 12-hour format for US, odd offsets for international, no timezone abbreviations
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
 * Get today's date string in the target timezone (YYYY-MM-DD)
 */
function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Returns YYYY-MM-DD
}

/**
 * Get a date's date string in the target timezone (YYYY-MM-DD)
 */
function getDateInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // Returns YYYY-MM-DD
}

/**
 * Check if a game time falls within "tonight" in the target timezone
 * "Tonight" means any game that occurs on today's calendar date in that timezone
 */
export function isGameTonight(
  gameTimeUtc: string,
  timezone: string = 'America/New_York'
): boolean {
  try {
    const gameTime = new Date(gameTimeUtc);
    if (isNaN(gameTime.getTime())) {
      return false;
    }

    const todayInTZ = getTodayInTimezone(timezone);
    const gameDateInTZ = getDateInTimezone(gameTime, timezone);

    return todayInTZ === gameDateInTZ;
  } catch (error) {
    console.warn('Error checking if game is tonight:', error);
    return false;
  }
}

/**
 * DEPRECATED: Use isGameTonight instead
 * Get "tonight" boundaries in a specific timezone
 */
export function getTonightBoundaries(timezone: string = 'America/New_York'): {
  start: string;
  end: string;
} {
  // Simplified: just return a 24-hour window for today
  const today = getTodayInTimezone(timezone);
  return {
    start: `${today}T00:00:00.000Z`,
    end: `${today}T23:59:59.999Z`,
  };
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