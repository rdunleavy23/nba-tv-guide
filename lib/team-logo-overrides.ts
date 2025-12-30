/**
 * Team-specific logo color overrides
 * Manual tuning for each team to ensure "best in class" visibility and detail preservation
 *
 * Each team can specify color mappings from original colors to custom gray values
 * This allows fine-tuned control over internal details and contrast
 */

export interface ColorOverride {
  from: string; // Original color (hex, rgb, or named)
  to: string;   // Replacement color (hex or rgb)
  tolerance?: number; // Color matching tolerance (0-100, default 10)
}

export interface TeamLogoOverride {
  colors?: ColorOverride[];
  defaultBrightness?: number; // 0-255, fallback if color not in overrides
  notes?: string; // Developer notes about why these values were chosen
}

/**
 * NBA Team Logo Overrides
 * Manually tuned for each team to preserve internal details
 */
export const TEAM_LOGO_OVERRIDES: Record<string, TeamLogoOverride> = {
  // EASTERN CONFERENCE

  'ATL': {
    // Atlanta Hawks - Red/white hawk
    colors: [
      { from: '#E03A3E', to: 'rgb(220, 220, 220)' }, // Red hawk body → light gray
      { from: '#C1D32F', to: 'rgb(240, 240, 240)' }, // Yellow/green accents → near white
      { from: '#26282A', to: 'rgb(180, 180, 180)' }, // Black details → medium gray
    ],
    notes: 'Hawk outline needs contrast against body',
  },

  'BOS': {
    // Boston Celtics - Green leprechaun/shamrock
    colors: [
      { from: '#007A33', to: 'rgb(200, 200, 200)' }, // Celtics green → medium-light gray
      { from: '#BA9653', to: 'rgb(230, 230, 230)' }, // Gold accents → light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black outlines → darker gray
    ],
    notes: 'Leprechaun/shamrock details need clear outline separation',
  },

  'BKN': {
    // Brooklyn Nets - Black/white shield
    colors: [
      { from: '#000000', to: 'rgb(190, 190, 190)' }, // Black → medium gray for visibility
      { from: '#FFFFFF', to: 'rgb(255, 255, 255)' }, // White → white (already visible)
    ],
    notes: 'Mostly monochrome logo, needs contrast for shield details',
  },

  'CHA': {
    // Charlotte Hornets - Teal/purple hornet
    colors: [
      { from: '#00788C', to: 'rgb(210, 210, 210)' }, // Teal → light gray
      { from: '#1D1160', to: 'rgb(180, 180, 180)' }, // Purple → medium gray
      { from: '#A1A1A4', to: 'rgb(230, 230, 230)' }, // Gray accents → near white
    ],
    notes: 'Hornet wings and stripes need clear separation',
  },

  'CHI': {
    // Chicago Bulls - Red bull head
    colors: [
      { from: '#CE1141', to: 'rgb(220, 220, 220)' }, // Bulls red → light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black outlines → darker gray
    ],
    notes: 'Bull horns and facial details critical for recognition',
  },

  'CLE': {
    // Cleveland Cavaliers - Wine/gold 'C' sword
    colors: [
      { from: '#860038', to: 'rgb(200, 200, 200)' }, // Wine → medium-light gray
      { from: '#FDBB30', to: 'rgb(240, 240, 240)' }, // Gold → near white
      { from: '#041E42', to: 'rgb(175, 175, 175)' }, // Navy → medium gray
    ],
    notes: 'Sword through C needs contrast',
  },

  'DET': {
    // Detroit Pistons - Red/blue horse head
    colors: [
      { from: '#C8102E', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#006BB6', to: 'rgb(200, 200, 200)' }, // Blue → medium-light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black → darker gray
    ],
    notes: 'Horse mane details need separation',
  },

  'IND': {
    // Indiana Pacers - Navy/gold 'P'
    colors: [
      { from: '#002D62', to: 'rgb(195, 195, 195)' }, // Navy → medium gray
      { from: '#FDBB30', to: 'rgb(240, 240, 240)' }, // Gold → near white
    ],
    notes: 'P with basketball needs clear outline',
  },

  'MIA': {
    // Miami Heat - Red/black flaming ball
    colors: [
      { from: '#98002E', to: 'rgb(210, 210, 210)' }, // Heat red → light gray
      { from: '#F9A01B', to: 'rgb(235, 235, 235)' }, // Orange/yellow → very light gray
      { from: '#000000', to: 'rgb(175, 175, 175)' }, // Black → medium gray
    ],
    notes: 'Flame details critical',
  },

  'MIL': {
    // Milwaukee Bucks - Green/cream deer head
    colors: [
      { from: '#00471B', to: 'rgb(190, 190, 190)' }, // Hunter green → medium gray
      { from: '#EEE1C6', to: 'rgb(245, 245, 245)' }, // Cream → very light gray
      { from: '#0077C0', to: 'rgb(210, 210, 210)' }, // Blue accents → light gray
    ],
    notes: 'Deer antlers need clear definition',
  },

  'NYK': {
    // New York Knicks - Orange/blue triangle
    colors: [
      { from: '#F58426', to: 'rgb(230, 230, 230)' }, // Orange → light gray
      { from: '#006BB6', to: 'rgb(200, 200, 200)' }, // Blue → medium-light gray
    ],
    notes: 'Simple logo, maintain triangle clarity',
  },

  'ORL': {
    // Orlando Magic - Blue/black star
    colors: [
      { from: '#0077C0', to: 'rgb(210, 210, 210)' }, // Blue → light gray
      { from: '#C4CED4', to: 'rgb(235, 235, 235)' }, // Silver → very light gray
      { from: '#000000', to: 'rgb(175, 175, 175)' }, // Black → medium gray
    ],
    notes: 'Star points need definition',
  },

  'PHI': {
    // Philadelphia 76ers - Red/blue with '76' and stars
    colors: [
      { from: '#006BB6', to: 'rgb(195, 195, 195)' }, // Blue → medium gray (critical for '76')
      { from: '#ED174C', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#002B5C', to: 'rgb(175, 175, 175)' }, // Dark blue → darker gray (stars)
      { from: '#FFFFFF', to: 'rgb(250, 250, 250)' }, // White → near white
    ],
    notes: 'CRITICAL: 76 with stars must be visible - this is the reference logo',
  },

  'TOR': {
    // Toronto Raptors - Red/black/silver claw
    colors: [
      { from: '#CE1141', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black → darker gray
      { from: '#A1A1A4', to: 'rgb(235, 235, 235)' }, // Silver → very light gray
    ],
    notes: 'Basketball claw marks need separation',
  },

  'WAS': {
    // Washington Wizards - Red/navy/white
    colors: [
      { from: '#002B5C', to: 'rgb(195, 195, 195)' }, // Navy → medium gray
      { from: '#E31837', to: 'rgb(225, 225, 225)' }, // Red → light gray
      { from: '#C4CED4', to: 'rgb(240, 240, 240)' }, // Silver → near white
    ],
    notes: 'Monument/wizard details',
  },

  // WESTERN CONFERENCE

  'DAL': {
    // Dallas Mavericks - Blue horse head
    colors: [
      { from: '#00538C', to: 'rgb(205, 205, 205)' }, // Blue → medium-light gray
      { from: '#002B5E', to: 'rgb(180, 180, 180)' }, // Navy → medium gray
      { from: '#B8C4CA', to: 'rgb(235, 235, 235)' }, // Silver → very light gray
    ],
    notes: 'Horse head mane details',
  },

  'DEN': {
    // Denver Nuggets - Navy/gold pickaxe mountain
    colors: [
      { from: '#0E2240', to: 'rgb(185, 185, 185)' }, // Navy → medium gray
      { from: '#FEC524', to: 'rgb(245, 245, 245)' }, // Gold → very light gray
      { from: '#8B2131', to: 'rgb(210, 210, 210)' }, // Burgundy → light gray
    ],
    notes: 'Mountain peaks and pickaxe need contrast',
  },

  'GSW': {
    // Golden State Warriors - Blue/gold bridge
    colors: [
      { from: '#1D428A', to: 'rgb(200, 200, 200)' }, // Blue → medium-light gray
      { from: '#FFC72C', to: 'rgb(245, 245, 245)' }, // Gold → very light gray
    ],
    notes: 'Bridge structure needs clarity',
  },

  'HOU': {
    // Houston Rockets - Red rocket
    colors: [
      { from: '#CE1141', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#000000', to: 'rgb(175, 175, 175)' }, // Black → medium gray
      { from: '#C4CED4', to: 'rgb(240, 240, 240)' }, // Silver → near white
    ],
    notes: 'Rocket flame details',
  },

  'LAC': {
    // LA Clippers - Red/blue ship
    colors: [
      { from: '#C8102E', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#1D428A', to: 'rgb(200, 200, 200)' }, // Blue → medium-light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black → darker gray
    ],
    notes: 'Ship sail details',
  },

  'LAL': {
    // LA Lakers - Purple/gold 'Lakers'
    colors: [
      { from: '#552583', to: 'rgb(200, 200, 200)' }, // Purple → medium-light gray
      { from: '#FDB927', to: 'rgb(240, 240, 240)' }, // Gold → near white
    ],
    notes: 'Text readability critical',
  },

  'MEM': {
    // Memphis Grizzlies - Navy/blue bear
    colors: [
      { from: '#5D76A9', to: 'rgb(215, 215, 215)' }, // Blue → light gray
      { from: '#12173F', to: 'rgb(180, 180, 180)' }, // Navy → medium gray
      { from: '#F5B112', to: 'rgb(240, 240, 240)' }, // Gold → near white
    ],
    notes: 'Bear claw and facial details',
  },

  'MIN': {
    // Minnesota Timberwolves - Blue/green wolf
    colors: [
      { from: '#0C2340', to: 'rgb(185, 185, 185)' }, // Navy → medium gray
      { from: '#236192', to: 'rgb(205, 205, 205)' }, // Blue → medium-light gray
      { from: '#9EA2A2', to: 'rgb(230, 230, 230)' }, // Gray → light gray
      { from: '#78BE20', to: 'rgb(240, 240, 240)' }, // Green → near white
    ],
    notes: 'Wolf fur texture details',
  },

  'NOP': {
    // New Orleans Pelicans - Navy/gold/red pelican
    colors: [
      { from: '#0C2340', to: 'rgb(190, 190, 190)' }, // Navy → medium gray
      { from: '#C8102E', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#85714D', to: 'rgb(210, 210, 210)' }, // Gold → light gray
    ],
    notes: 'Pelican wing and beak details',
  },

  'OKC': {
    // Oklahoma City Thunder - Blue/orange thunder
    colors: [
      { from: '#007AC1', to: 'rgb(215, 215, 215)' }, // Blue → light gray
      { from: '#EF3B24', to: 'rgb(230, 230, 230)' }, // Orange → very light gray
      { from: '#002D62', to: 'rgb(185, 185, 185)' }, // Navy → medium gray
      { from: '#FDBB30', to: 'rgb(245, 245, 245)' }, // Yellow → very light gray
    ],
    notes: 'Thunder bolt details',
  },

  'PHX': {
    // Phoenix Suns - Orange/purple sunburst
    colors: [
      { from: '#E56020', to: 'rgb(230, 230, 230)' }, // Orange → light gray
      { from: '#1D1160', to: 'rgb(190, 190, 190)' }, // Purple → medium gray
      { from: '#63727A', to: 'rgb(210, 210, 210)' }, // Gray → light gray
    ],
    notes: 'Sun rays need separation',
  },

  'POR': {
    // Portland Trail Blazers - Red/black pinwheel
    colors: [
      { from: '#E03A3E', to: 'rgb(220, 220, 220)' }, // Red → light gray
      { from: '#000000', to: 'rgb(170, 170, 170)' }, // Black → darker gray
    ],
    notes: 'Pinwheel rotation effect needs contrast',
  },

  'SAC': {
    // Sacramento Kings - Purple/gray lion
    colors: [
      { from: '#5A2D81', to: 'rgb(200, 200, 200)' }, // Purple → medium-light gray
      { from: '#63727A', to: 'rgb(220, 220, 220)' }, // Gray → light gray
      { from: '#000000', to: 'rgb(175, 175, 175)' }, // Black → medium gray
    ],
    notes: 'Lion mane and crown details',
  },

  'SAS': {
    // San Antonio Spurs - Black/silver spur
    colors: [
      { from: '#C4CED4', to: 'rgb(235, 235, 235)' }, // Silver → very light gray
      { from: '#000000', to: 'rgb(180, 180, 180)' }, // Black → medium gray
    ],
    notes: 'Spur details need visibility on dark background',
  },

  'UTA': {
    // Utah Jazz - Navy/gold/green mountains
    colors: [
      { from: '#002B5C', to: 'rgb(190, 190, 190)' }, // Navy → medium gray
      { from: '#00471B', to: 'rgb(200, 200, 200)' }, // Green → medium-light gray
      { from: '#F9A01B', to: 'rgb(240, 240, 240)' }, // Gold → near white
    ],
    notes: 'Mountain layering needs separation',
  },
};
