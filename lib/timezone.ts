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