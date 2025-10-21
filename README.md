# ScreenAssist - NBA Games Tonight

A clean, fast NBA scoreboard app that shows which channel games are on tonight. Built with Next.js 15, designed for mobile-first with accessibility in mind.

## Features

- **Clean Interface**: Shows only national TV and streaming platforms (no RSNs)
- **Fast Loading**: Server-side rendering with 60s revalidation
- **Accessibility**: WCAG AA compliant, keyboard navigation, screen reader support
- **Mobile-First**: Responsive design with safe-area-inset for iOS
- **No Spoilers**: Optional mode to hide scores and game status
- **Error Handling**: Friendly error states with retry and ESPN fallback

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Testing Checklist

### Edge Cases to Test

#### DST & Timezone Edge Cases
- [ ] Spring forward transition (March)
- [ ] Fall back transition (November) 
- [ ] Hawaii timezone (UTC-10)
- [ ] Alaska timezone (UTC-9)
- [ ] International timezones (UTC+/-12)

#### Empty State Scenarios
- [ ] All-Star break (no games)
- [ ] Offseason (no games)
- [ ] Single game day
- [ ] 15-game day (maximum)

#### Data Quality Edge Cases
- [ ] Duplicate broadcast entries
- [ ] Missing team data
- [ ] Malformed ESPN API responses
- [ ] Network name variations (NBA TV vs NBATV)
- [ ] National exclusive vs League Pass conflicts

#### Accessibility Testing
- [ ] Keyboard navigation (Tab, Arrow keys)
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Focus indicators visible
- [ ] Color contrast ratios (WCAG AA)

#### Mobile Testing
- [ ] iOS safe area handling
- [ ] Android back button
- [ ] Touch targets (44px minimum)
- [ ] Landscape orientation
- [ ] Small screen (320px width)

#### Performance Testing
- [ ] Hydration mismatch warnings
- [ ] CSS variable flicker
- [ ] Badge layout shifts
- [ ] Network request failures
- [ ] Slow 3G connection

## Design Philosophy

Inspired by:
- **Ceefax/Teletext**: Grid-first clarity and information density
- **Plain Text Sports**: Restraint and focus on essential information
- **ESPN/TNT Scorebugs**: Grouped micro-UI elements
- **Vignelli Subway Standards**: Disciplined visual hierarchy

## Technical Notes

- **SSR Hydration**: Inline script prevents accent color flicker
- **Network Filtering**: Only shows nationals (ESPN, ABC, TNT, NBA TV) and streamers
- **Contrast Compliance**: Auto-detects luminance for WCAG AA text colors
- **Defensive Parsing**: Handles ESPN API shape drift gracefully
- **Brand Compliance**: Text chips only, no logos or promotional copy

## Deploy

Deploy on Vercel for optimal Next.js performance.
