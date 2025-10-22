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
 * Get "tonight" boundaries in user's local timezone
 * Returns start and end timestamps for 3:59:59 AM – 11:59:59 PM local
 */
export function getTonightBoundaries(timezone: string = 'America/New_York'): {
  start: string;
  end: string;
} {
  const now = new Date();
  
  // Get today's date in the user's timezone
  const today = new Intl.DateTimeFormat('en-CA', { 
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  }).format(now);
  
  // Create start time: 3:59:59 AM local
  const startTime = new Date(`${today}T03:59:59`);
  const startUtc = new Date(startTime.toLocaleString('en-US', { timeZone: timezone }));
  
  // Create end time: 11:59:59 PM local  
  const endTime = new Date(`${today}T23:59:59`);
  const endUtc = new Date(endTime.toLocaleString('en-US', { timeZone: timezone }));
  
  return {
    start: startUtc.toISOString(),
    end: endUtc.toISOString(),
  };
}

/**
 * Check if a game time falls within "tonight" boundaries
 */
export function isGameTonight(
  gameTimeUtc: string, 
  timezone: string = 'America/New_York'
): boolean {
  try {
    const gameTime = new Date(gameTimeUtc);
    const boundaries = getTonightBoundaries(timezone);
    const start = new Date(boundaries.start);
    const end = new Date(boundaries.end);
    
    return gameTime >= start && gameTime <= end;
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