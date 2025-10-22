/**
 * Region detection and ZIP code override management
 * Handles server-side region detection via Edge headers and client-side ZIP override
 */

export interface Region {
  country: string;
  state: string | null;
  zip?: string;
}

/**
 * Get coarse region from Edge headers (server-side)
 * Reads x-vercel-ip-country and x-vercel-ip-country-region
 */
export function getServerRegion(headers: Headers): Region {
  const country = headers.get('x-vercel-ip-country') || 'US';
  const state = headers.get('x-vercel-ip-country-region') || null;
  
  return {
    country,
    state,
  };
}

/**
 * Get ZIP code override from localStorage (client-side)
 */
export function getClientRegionOverride(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('screenassist-zip-override');
  } catch {
    return null;
  }
}

/**
 * Set ZIP code override in localStorage (client-side)
 */
export function setClientRegionOverride(zip: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('screenassist-zip-override', zip);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Basic ZIP code to state mapping (first 3 digits)
 * This is a simplified mapping for v0 - can be enhanced later
 */
export function deriveStateFromZip(zip: string): string | null {
  if (!zip || zip.length < 3) return null;
  
  const prefix = zip.substring(0, 3);
  
  // Basic ZIP prefix to state mapping (simplified for v0)
  const zipToState: Record<string, string> = {
    // California
    '900': 'CA', '902': 'CA', '904': 'CA', '905': 'CA', '906': 'CA', '907': 'CA', '908': 'CA', '910': 'CA', '911': 'CA', '912': 'CA', '913': 'CA', '914': 'CA', '915': 'CA', '916': 'CA', '917': 'CA', '918': 'CA', '919': 'CA', '920': 'CA', '921': 'CA', '922': 'CA', '923': 'CA', '924': 'CA', '925': 'CA', '926': 'CA', '927': 'CA', '928': 'CA', '930': 'CA', '931': 'CA', '932': 'CA', '933': 'CA', '934': 'CA', '935': 'CA', '936': 'CA', '937': 'CA', '938': 'CA', '939': 'CA', '940': 'CA', '941': 'CA', '942': 'CA', '943': 'CA', '944': 'CA', '945': 'CA', '946': 'CA', '947': 'CA', '948': 'CA', '949': 'CA', '950': 'CA', '951': 'CA', '952': 'CA', '953': 'CA', '954': 'CA', '955': 'CA', '956': 'CA', '957': 'CA', '958': 'CA', '959': 'CA', '960': 'CA', '961': 'CA', '962': 'CA',
    
    // New York
    '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '105': 'NY', '106': 'NY', '107': 'NY', '108': 'NY', '109': 'NY', '110': 'NY', '111': 'NY', '112': 'NY', '113': 'NY', '114': 'NY', '115': 'NY', '116': 'NY', '117': 'NY', '118': 'NY', '119': 'NY', '120': 'NY', '121': 'NY', '122': 'NY', '123': 'NY', '124': 'NY', '125': 'NY', '126': 'NY', '127': 'NY', '128': 'NY', '129': 'NY', '130': 'NY', '131': 'NY', '132': 'NY', '133': 'NY', '134': 'NY', '135': 'NY', '136': 'NY', '137': 'NY', '138': 'NY', '139': 'NY', '140': 'NY', '141': 'NY', '142': 'NY', '143': 'NY', '144': 'NY', '145': 'NY', '146': 'NY', '147': 'NY', '148': 'NY', '149': 'NY',
    
    // New Jersey
    '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ', '077': 'NJ', '078': 'NJ', '079': 'NJ', '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
    
    // Connecticut
    '060': 'CT', '061': 'CT', '062': 'CT', '063': 'CT', '064': 'CT', '065': 'CT', '066': 'CT', '067': 'CT', '068': 'CT', '069': 'CT',
    
    // Add more states as needed for v0
  };
  
  return zipToState[prefix] || null;
}

/**
 * Derive full region object from ZIP code
 */
export function deriveRegionFromZip(zip: string): Region {
  const state = deriveStateFromZip(zip);
  
  return {
    country: 'US', // Assume US for ZIP codes
    state,
    zip,
  };
}

/**
 * Check if region is known (has state or ZIP)
 */
export function isRegionKnown(region: Region | null): boolean {
  if (!region) return false;
  return !!(region.state || region.zip);
}

/**
 * Get display-friendly region string
 */
export function getRegionDisplayString(region: Region | null): string {
  if (!region) return 'Unknown';
  if (region.zip) return `ZIP ${region.zip}`;
  if (region.state) return region.state;
  return region.country;
}
