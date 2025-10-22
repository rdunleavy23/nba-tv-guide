/**
 * Simplified localStorage helpers for NBA Tonight
 * Only handles ZIP code override - no complex state management
 */

/**
 * Get ZIP code override from localStorage
 */
export function getZipOverride(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('screenassist-zip-override');
  } catch {
    return null;
  }
}

/**
 * Set ZIP code override in localStorage
 */
export function setZipOverride(zip: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('screenassist-zip-override', zip);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear ZIP code override
 */
export function clearZipOverride(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('screenassist-zip-override');
  } catch {
    // Ignore localStorage errors
  }
}