/**
 * Geolocation utilities for blackout detection
 * Handles browser geolocation API with privacy considerations
 */

export interface UserLocation {
  lat: number;
  lon: number;
  region: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Request user's location using browser geolocation API
 * Returns coordinates and detected region
 */
export async function requestLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const region = await detectRegion(latitude, longitude);
          
          resolve({
            lat: latitude,
            lon: longitude,
            region
          });
        } catch (error) {
          reject({
            code: 2,
            message: 'Failed to detect region from coordinates'
          });
        }
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject({
          code: error.code,
          message: errorMessage
        });
      },
      options
    );
  });
}

/**
 * Detect region/state from coordinates using reverse geocoding
 * Falls back to approximate region detection based on coordinates
 */
export async function detectRegion(lat: number, lon: number): Promise<string> {
  try {
    // Try reverse geocoding first (more accurate)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.principalSubdivision || data.countryName || 'Unknown';
    }
  } catch (error) {
    console.warn('Reverse geocoding failed, using coordinate-based detection:', error);
  }
  
  // Fallback: approximate region detection based on US coordinates
  return detectRegionFromCoordinates(lat, lon);
}

/**
 * Fallback region detection based on US state boundaries
 * Uses approximate coordinate ranges for major regions
 */
function detectRegionFromCoordinates(lat: number, lon: number): string {
  // US state approximations (simplified)
  const regions = [
    { name: 'California', latMin: 32.5, latMax: 42.0, lonMin: -124.5, lonMax: -114.0 },
    { name: 'Texas', latMin: 25.8, latMax: 36.5, lonMin: -106.6, lonMax: -93.5 },
    { name: 'Florida', latMin: 24.4, latMax: 31.0, lonMin: -87.6, lonMax: -80.0 },
    { name: 'New York', latMin: 40.5, latMax: 45.0, lonMin: -79.8, lonMax: -71.9 },
    { name: 'Illinois', latMin: 36.9, latMax: 42.5, lonMin: -91.5, lonMax: -87.0 },
    { name: 'Pennsylvania', latMin: 39.7, latMax: 42.3, lonMin: -80.5, lonMax: -74.7 },
    { name: 'Ohio', latMin: 38.4, latMax: 42.3, lonMin: -84.8, lonMax: -80.5 },
    { name: 'Georgia', latMin: 30.4, latMax: 35.0, lonMin: -85.6, lonMax: -80.7 },
    { name: 'North Carolina', latMin: 33.8, latMax: 36.6, lonMin: -84.3, lonMax: -75.5 },
    { name: 'Michigan', latMin: 41.7, latMax: 48.3, lonMin: -90.4, lonMax: -82.1 },
  ];
  
  for (const region of regions) {
    if (lat >= region.latMin && lat <= region.latMax && 
        lon >= region.lonMin && lon <= region.lonMax) {
      return region.name;
    }
  }
  
  // Default fallback
  return 'United States';
}

/**
 * Get blackout rules for a specific region
 * Returns RSN blackout map for NBA games
 */
export function getBlackoutRules(region: string): Record<string, string[]> {
  // NBA RSN blackout rules by region
  const blackoutMap: Record<string, string[]> = {
    'California': ['Bally Sports West', 'Bally Sports SoCal', 'NBC Sports Bay Area', 'NBC Sports California'],
    'Texas': ['Bally Sports Southwest', 'Bally Sports Texas'],
    'Florida': ['Bally Sports Florida', 'Bally Sports Sun'],
    'New York': ['MSG', 'YES Network', 'Bally Sports Buffalo'],
    'Illinois': ['NBC Sports Chicago'],
    'Pennsylvania': ['NBC Sports Philadelphia'],
    'Ohio': ['Bally Sports Ohio'],
    'Georgia': ['Bally Sports Southeast'],
    'North Carolina': ['Bally Sports Southeast'],
    'Michigan': ['Bally Sports Detroit'],
    'Massachusetts': ['NBC Sports Boston'],
    'Colorado': ['Altitude Sports'],
    'Utah': ['AT&T SportsNet Rocky Mountain'],
    'Oregon': ['Root Sports Northwest'],
    'Washington': ['Root Sports Northwest'],
    'Arizona': ['Bally Sports Arizona'],
    'Minnesota': ['Bally Sports North'],
    'Wisconsin': ['Bally Sports Wisconsin'],
    'Indiana': ['Bally Sports Indiana'],
    'Tennessee': ['Bally Sports Southeast'],
    'Louisiana': ['Bally Sports New Orleans'],
    'Oklahoma': ['Bally Sports Oklahoma'],
    'Missouri': ['Bally Sports Kansas City', 'Bally Sports Midwest'],
    'Kentucky': ['Bally Sports Southeast'],
    'Alabama': ['Bally Sports Southeast'],
    'Mississippi': ['Bally Sports Southeast'],
    'Arkansas': ['Bally Sports Southeast'],
    'South Carolina': ['Bally Sports Southeast'],
    'Virginia': ['NBC Sports Washington'],
    'Maryland': ['NBC Sports Washington'],
    'District of Columbia': ['NBC Sports Washington'],
    'West Virginia': ['AT&T SportsNet Pittsburgh'],
    'Delaware': ['NBC Sports Philadelphia'],
    'New Jersey': ['MSG', 'YES Network'],
    'Connecticut': ['NBC Sports Boston'],
    'Rhode Island': ['NBC Sports Boston'],
    'Vermont': ['NBC Sports Boston'],
    'New Hampshire': ['NBC Sports Boston'],
    'Maine': ['NBC Sports Boston'],
    'Nevada': ['Bally Sports West'],
    'New Mexico': ['Bally Sports Southwest'],
    'Montana': ['Root Sports Northwest'],
    'Idaho': ['Root Sports Northwest'],
    'Wyoming': ['Altitude Sports'],
    'North Dakota': ['Bally Sports North'],
    'South Dakota': ['Bally Sports North'],
    'Nebraska': ['Bally Sports Kansas City'],
    'Kansas': ['Bally Sports Kansas City'],
    'Iowa': ['Bally Sports Kansas City'],
  };
  
  return blackoutMap[region] || [];
}

/**
 * Check if a game would be blacked out for a user in a specific region
 */
export function checkGameBlackout(
  gameBroadcasts: string[], 
  userRegion: string
): { isBlackedOut: boolean; blackedOutNetworks: string[] } {
  const blackoutRules = getBlackoutRules(userRegion);
  const blackedOutNetworks = gameBroadcasts.filter(broadcast => 
    blackoutRules.some(rule => broadcast.includes(rule))
  );
  
  return {
    isBlackedOut: blackedOutNetworks.length > 0,
    blackedOutNetworks
  };
}

/**
 * Get user-friendly region display name
 */
export function getRegionDisplayName(region: string): string {
  const displayNames: Record<string, string> = {
    'California': 'California',
    'Texas': 'Texas', 
    'Florida': 'Florida',
    'New York': 'New York',
    'Illinois': 'Illinois',
    'Pennsylvania': 'Pennsylvania',
    'Ohio': 'Ohio',
    'Georgia': 'Georgia',
    'North Carolina': 'North Carolina',
    'Michigan': 'Michigan',
    'Massachusetts': 'Massachusetts',
    'Colorado': 'Colorado',
    'Utah': 'Utah',
    'Oregon': 'Oregon',
    'Washington': 'Washington',
    'Arizona': 'Arizona',
    'Minnesota': 'Minnesota',
    'Wisconsin': 'Wisconsin',
    'Indiana': 'Indiana',
    'Tennessee': 'Tennessee',
    'Louisiana': 'Louisiana',
    'Oklahoma': 'Oklahoma',
    'Missouri': 'Missouri',
    'Kentucky': 'Kentucky',
    'Alabama': 'Alabama',
    'Mississippi': 'Mississippi',
    'Arkansas': 'Arkansas',
    'South Carolina': 'South Carolina',
    'Virginia': 'Virginia',
    'Maryland': 'Maryland',
    'District of Columbia': 'Washington DC',
    'West Virginia': 'West Virginia',
    'Delaware': 'Delaware',
    'New Jersey': 'New Jersey',
    'Connecticut': 'Connecticut',
    'Rhode Island': 'Rhode Island',
    'Vermont': 'Vermont',
    'New Hampshire': 'New Hampshire',
    'Maine': 'Maine',
    'Nevada': 'Nevada',
    'New Mexico': 'New Mexico',
    'Montana': 'Montana',
    'Idaho': 'Idaho',
    'Wyoming': 'Wyoming',
    'North Dakota': 'North Dakota',
    'South Dakota': 'South Dakota',
    'Nebraska': 'Nebraska',
    'Kansas': 'Kansas',
    'Iowa': 'Iowa',
  };
  
  return displayNames[region] || region;
}
