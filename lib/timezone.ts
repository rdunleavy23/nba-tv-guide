/**
 * Timezone utilities for proper game time localization
 * Handles browser detection, validation, and defensive formatting
 */

// Common timezone mappings for better UX
const TIMEZONE_DISPLAY_NAMES: Record<string, string> = {
  'America/New_York': 'Eastern Time',
  'America/Chicago': 'Central Time', 
  'America/Denver': 'Mountain Time',
  'America/Los_Angeles': 'Pacific Time',
  'America/Anchorage': 'Alaska Time',
  'Pacific/Honolulu': 'Hawaii Time',
  'Europe/London': 'London Time',
  'Europe/Paris': 'Central European Time',
  'Asia/Tokyo': 'Japan Time',
  'Australia/Sydney': 'Sydney Time',
};

// Fallback timezone chain
const FALLBACK_TIMEZONES = [
  'America/New_York', // Default fallback
  'UTC', // Universal fallback
];

/**
 * Get the browser's detected timezone
 * Returns the IANA timezone identifier
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect browser timezone:', error);
    return 'America/New_York';
  }
}

/**
 * Validate if a timezone string is a valid IANA timezone
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone with fallback chain
 * 1. Preferred timezone (if valid)
 * 2. Browser timezone
 * 3. Fallback timezones
 */
export function getTimezoneWithFallback(preferredTz?: string): string {
  // Check preferred timezone first
  if (preferredTz && isValidTimezone(preferredTz)) {
    return preferredTz;
  }
  
  // Try browser timezone
  const browserTz = getBrowserTimezone();
  if (isValidTimezone(browserTz)) {
    return browserTz;
  }
  
  // Use fallback chain
  for (const fallbackTz of FALLBACK_TIMEZONES) {
    if (isValidTimezone(fallbackTz)) {
      return fallbackTz;
    }
  }
  
  // Ultimate fallback
  return 'America/New_York';
}

/**
 * Format game time with defensive error handling
 * Handles invalid dates, timezone errors, and provides fallbacks
 */
export function formatGameTime(
  isoString: string, 
  tz: string, 
  hour12: boolean,
  includeTimezone: boolean = true
): string {
  try {
    // Validate input
    if (!isoString || typeof isoString !== 'string') {
      console.warn('Invalid ISO string provided:', isoString);
      return 'TBD';
    }
    
    // Parse the date
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date parsed from:', isoString);
      return 'TBD';
    }
    
    // Validate timezone
    const validTz = isValidTimezone(tz) ? tz : getTimezoneWithFallback();
    
    // Format with timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: validTz,
      hour: 'numeric',
      minute: '2-digit',
      hour12,
    };
    
    const timeString = date.toLocaleTimeString('en-US', options);
    
    // Add timezone abbreviation if requested
    if (includeTimezone) {
      const tzAbbr = getTimezoneAbbreviation(validTz);
      return `${timeString} ${tzAbbr}`;
    }
    
    return timeString;
    
  } catch (error) {
    console.warn('Error formatting game time:', error, {
      isoString,
      tz,
      hour12
    });
    
    // Ultimate fallback - try without timezone
    try {
      const date = new Date(isoString);
      if (!isNaN(date.getTime())) {
        const timeString = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12,
        });
        
        if (includeTimezone) {
          const tzAbbr = getTimezoneAbbreviation(tz);
          return `${timeString} ${tzAbbr}`;
        }
        
        return timeString;
      }
    } catch {
      // Ignore secondary error
    }
    
    return 'TBD';
  }
}

/**
 * Get display name for timezone
 */
export function getTimezoneDisplayName(tz: string): string {
  return TIMEZONE_DISPLAY_NAMES[tz] || tz.replace('_', ' ');
}

/**
 * Get all common US timezones for settings UI
 */
export function getCommonTimezones(): Array<{ value: string; label: string }> {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  ];
}

/**
 * Check if current timezone is in DST
 */
export function isDST(tz: string = getBrowserTimezone()): boolean {
  try {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    
    const janOffset = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'longOffset'
    }).formatToParts(jan).find(part => part.type === 'timeZoneName')?.value;
    
    const julOffset = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'longOffset'
    }).formatToParts(jul).find(part => part.type === 'timeZoneName')?.value;
    
    return janOffset !== julOffset;
  } catch {
    return false;
  }
}

/**
 * Get timezone abbreviation for inline display
 */
export function getTimezoneAbbreviation(tz: string): string {
  const abbreviations: Record<string, string> = {
    'America/New_York': 'ET',
    'America/Chicago': 'CT', 
    'America/Denver': 'MT',
    'America/Los_Angeles': 'PT',
    'America/Anchorage': 'AT',
    'Pacific/Honolulu': 'HT',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
    'Australia/Sydney': 'AEST',
  };
  
  return abbreviations[tz] || tz.split('/').pop()?.substring(0, 2).toUpperCase() || 'UTC';
}

/**
 * Debug info for development
 */
export function getTimezoneDebugInfo(tz: string): {
  timezone: string;
  displayName: string;
  isValid: boolean;
  isDST: boolean;
  browserTz: string;
  currentTime: string;
} {
  return {
    timezone: tz,
    displayName: getTimezoneDisplayName(tz),
    isValid: isValidTimezone(tz),
    isDST: isDST(tz),
    browserTz: getBrowserTimezone(),
    currentTime: formatGameTime(new Date().toISOString(), tz, true),
  };
}
