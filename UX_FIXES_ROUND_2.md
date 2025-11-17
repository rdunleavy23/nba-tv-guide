# NBA TV Guide - UX Fixes Round 2

**Date:** November 17, 2025
**Issues Identified:** 3 critical mobile UX problems

---

## Issue 1: Team Logos Not Visible on Mobile

### Current State
**File:** `components/team-glyph.tsx:16-30`

```tsx
<span className="inline-flex h-6 w-6 items-center justify-center
  rounded-full border border-muted-foreground/20 text-muted-foreground">
  <TeamLogo abbr={abbr} size={16} className="text-muted-foreground" />
</span>
```

**Problems:**
- Logo size: 16px (too small for mobile scanning)
- Border: `border-muted-foreground/20` (nearly invisible, especially in dark mode)
- Container: 24px (h-6 w-6) creates too much negative space around 16px logo
- Monochrome processing reduces contrast further

### Research: Icon Sizing Best Practices

**Apple Human Interface Guidelines (2024):**
- Minimum touch target: 44x44pt
- Minimum glyph size for readability: 20-24px
- Icon size should scale with text (current text is 16px base)

**Material Design 3 (2024):**
- Small icons: 20px minimum for mobile
- Medium icons: 24px standard
- Touch targets: 48x48dp minimum

**Current NBA TV Guide Text:**
- Matchup text: `text-base` = 16px
- Recommendation: Icons should be 20-24px to match text weight

### Solution: Enhanced Team Glyph Visibility

**Option A: Increase Size + Border Contrast (Recommended)**
```tsx
<span className="inline-flex h-7 w-7 items-center justify-center
  rounded-full border border-muted-foreground/30 bg-muted/30">
  <TeamLogo abbr={abbr} size={20} className="text-foreground" />
</span>
```

**Changes:**
- Container: 24px → 28px (h-6 w-6 → h-7 w-7) - 8pt grid aligned
- Logo size: 16px → 20px - better mobile visibility
- Border: 20% → 30% opacity - more visible
- Background: Add subtle `bg-muted/30` for depth
- Color: `text-muted-foreground` → `text-foreground` for contrast

**Option B: Remove Border, Increase Background (Alternative)**
```tsx
<span className="inline-flex h-7 w-7 items-center justify-center
  rounded-full bg-accent/20">
  <TeamLogo abbr={abbr} size={20} />
</span>
```

**Changes:**
- No border (cleaner look)
- Stronger background: `bg-accent/20`
- Same size increase: 28px container, 20px logo

**Option C: Outline Style (Maximum Contrast)**
```tsx
<span className="inline-flex h-7 w-7 items-center justify-center
  rounded-full border-2 border-muted-foreground/40">
  <TeamLogo abbr={abbr} size={20} />
</span>
```

**Changes:**
- Thicker border: `border-2` instead of default `border`
- Higher opacity: 40% instead of 20%
- No background (pure outline)

### Recommendation: **Option A**
Provides best balance of:
- ✅ Visibility (larger size + background)
- ✅ Consistency (stays on 8pt grid)
- ✅ Skimmability (doesn't dominate, but clearly visible)
- ✅ Accessibility (sufficient contrast)

---

## Issue 2: Settings Menu Feels Incomplete

### Current State
**File:** `components/settings-dialog.tsx:23-60`

**Current Settings:**
- ✅ Time Display (ET vs Local)

**Missing:**
- ❌ Theme selection (Dark/Light/System)
- ❌ Visual indicator of current setting
- ❌ Feels sparse/unfinished

### Research: Theme Switching Best Practices

**Web.dev Patterns (2024):**
```tsx
// Recommended approach: next-themes package
// Handles system preference + localStorage + SSR
```

**Current Implementation:**
- Uses `prefers-color-scheme` media query
- No manual override option
- No theme persistence

**Industry Standard:**
- System (auto) - default
- Light - manual override
- Dark - manual override

### Solution: Add Theme Selector

**Install Dependency:**
```bash
npm install next-themes
```

**Implementation Steps:**

#### 1. Create Theme Provider
**File:** `components/theme-provider.tsx` (NEW)

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### 2. Update Layout
**File:** `app/layout.tsx`

```tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 3. Update Settings Dialog
**File:** `components/settings-dialog.tsx`

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Monitor, Sun, Moon } from 'lucide-react';

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateMode } = useTimeZone();
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* THEME SETTING - NEW */}
          <div className="space-y-2">
            <Label>Appearance</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs font-medium">Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs font-medium">System</span>
              </button>
            </div>
          </div>

          {/* TIMEZONE SETTING - EXISTING */}
          <div className="space-y-2">
            <Label>Time Display</Label>
            {/* ... existing timezone code ... */}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4. Update Globals CSS
**File:** `app/globals.css`

Remove the `@media (prefers-color-scheme: dark)` block and use class-based theming:

```css
/* Light mode (default) */
:root {
  --background: #ffffff;
  --foreground: #171717;
  /* ... other vars ... */
}

/* Dark mode (when .dark class is on html) */
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  /* ... other vars ... */
}
```

### Expected Impact
- ✅ Settings feel more complete (2 settings instead of 1)
- ✅ User control over appearance (not just system default)
- ✅ Industry-standard 3-option theme selector
- ✅ Theme persists across sessions (localStorage)

---

## Issue 3: Column Alignment (Variable Badge Widths)

### Current State
**File:** `app/page.tsx:28-52`

```tsx
<a className="group flex items-center gap-4 ...">
  <div className="flex-1 min-w-0 ...">Matchup</div>
  <GameTime className="w-20 flex-shrink-0 ..." />
  <div className="flex-shrink-0">
    <AnswerChip game={game} />  {/* Variable width! */}
  </div>
  <ExternalLink className="h-4 w-4 flex-shrink-0 ..." />
</a>
```

**Problem:**
- `<AnswerChip>` has variable width:
  - "LP" = ~50px
  - "ESPN" = ~60px
  - "Prime Video" = ~110px
  - "NBA TV" = ~70px
- Time column (`w-20` = 80px) is BEFORE the badge
- Since badge width varies, the external link icon position shifts
- Creates misalignment across rows

**Visual Example:**
```
[Matchup]          [7:00 PM]  [LP]           [→]
[Matchup]          [7:30 PM]  [ESPN]         [→]
[Matchup]          [8:00 PM]  [Prime Video]  [→]
                      ↑            ↑
              Times aligned    Badges NOT aligned
                              Icons shift left/right
```

### Research: Column Alignment Best Practices

**CSS-Tricks Grid vs Flexbox (2024):**
> "For tabular data with aligned columns, CSS Grid is superior to Flexbox. Flexbox is one-dimensional and can't enforce column alignment across rows."

**Material Design Tables:**
> "Align similar data types in vertical columns. Numeric data should align right, text data should align left."

**ESPN/theScore Mobile Analysis:**
- Both use fixed-width columns for times
- Both use fixed-width columns for network badges
- Alignment is consistent across all rows

### Solution: Fixed-Width Badge Container

**Option A: Fixed Width Badge (Recommended)**
```tsx
<a className="group flex items-center gap-4 ...">
  <div className="flex-1 min-w-0 ...">Matchup</div>
  <GameTime className="w-20 flex-shrink-0 ..." />

  {/* Fixed width container for badge */}
  <div className="w-24 flex-shrink-0 flex justify-end">
    <AnswerChip game={game} />
  </div>

  <ExternalLink className="h-4 w-4 flex-shrink-0 ..." />
</a>
```

**Changes:**
- Badge container: `w-24` (96px) - accommodates "Prime Video"
- Justify: `justify-end` - right-align badges within container
- Times + Badges + Icon now all aligned

**Sizing Breakdown:**
- "LP": ~50px → 96px container (46px right padding)
- "ESPN": ~60px → 96px container (36px right padding)
- "Prime Video": ~110px → 96px container (will need truncation)
- "NBA TV": ~70px → 96px container (26px right padding)

**Option B: Right-Align Everything After Matchup (Alternative)**
```tsx
<a className="group flex items-center gap-4 ...">
  <div className="flex-1 min-w-0 ...">Matchup</div>

  {/* Right section with fixed layout */}
  <div className="flex items-center gap-4 flex-shrink-0">
    <GameTime className="w-20 text-right ..." />
    <div className="w-24 flex justify-end">
      <AnswerChip game={game} />
    </div>
    <ExternalLink className="h-4 w-4" />
  </div>
</a>
```

**Changes:**
- Group time + badge + icon into fixed-width section
- Guarantees alignment across all rows
- More rigid but perfectly aligned

**Option C: Truncate Long Badges**

Update `AnswerChip` to enforce max width:

```tsx
<Badge className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md ... max-w-24">
  <PlatformIcon label={label} kind={primaryOption.kind} />
  <span className="truncate">{label}</span>
</Badge>
```

**Changes:**
- `max-w-24` (96px) - enforces maximum width
- `truncate` on text span - ellipsis for overflow
- "Prime Video" becomes "Prime Vi..."

### Recommendation: **Option A + Badge Truncation**

Combine fixed container with badge truncation:

```tsx
// In app/page.tsx
<div className="w-24 flex-shrink-0 flex justify-end">
  <AnswerChip game={game} />
</div>

// In components/answer-chip.tsx
<Badge className="... max-w-full">
  <PlatformIcon label={label} kind={primaryOption.kind} />
  <span className="truncate">{label}</span>
</Badge>
```

**Benefits:**
- ✅ Perfect alignment across all rows
- ✅ Times always at same x-position
- ✅ Icons always at same x-position
- ✅ Badges right-aligned for visual balance
- ✅ Long labels truncate gracefully
- ✅ No horizontal overflow on small screens

### Expected Impact
- **Before:** Times/icons shift 20-60px left/right per row
- **After:** Times/icons perfectly aligned (0px variance)
- **User Experience:** Easier scanning, more professional appearance

---

## Implementation Priority

### Phase 1: Critical Alignment Fix (30 minutes)
1. ✅ Fix badge column alignment (Option A)
2. ✅ Add truncation to AnswerChip

### Phase 2: Visibility Enhancement (20 minutes)
1. ✅ Increase team glyph size (20px logo, 28px container)
2. ✅ Enhance border/background contrast

### Phase 3: Settings Enhancement (1-2 hours)
1. ✅ Install next-themes
2. ✅ Create ThemeProvider
3. ✅ Update settings dialog with theme selector
4. ✅ Update globals.css for class-based theming

**Total Estimated Time:** 2-3 hours

---

## Testing Checklist

**Team Logos:**
- [ ] Logos visible on iPhone SE (small screen)
- [ ] Logos visible in both light and dark mode
- [ ] Logos don't dominate layout (balanced with text)
- [ ] Border/background provides sufficient contrast

**Column Alignment:**
- [ ] Times aligned vertically across all rows
- [ ] External link icons aligned vertically
- [ ] No horizontal shifting between rows
- [ ] Long network names truncate with ellipsis

**Theme Selector:**
- [ ] Light mode works
- [ ] Dark mode works
- [ ] System mode respects OS preference
- [ ] Theme persists after page reload
- [ ] Settings dialog shows current theme highlighted
- [ ] Smooth transition between themes (no flash)

---

## Code Changes Summary

**Files to Modify:**
1. `components/team-glyph.tsx` - Increase size, enhance contrast
2. `app/page.tsx` - Add fixed-width badge container
3. `components/answer-chip.tsx` - Add max-width and truncation
4. `components/settings-dialog.tsx` - Add theme selector
5. `app/layout.tsx` - Add ThemeProvider
6. `app/globals.css` - Change from media query to class-based theming

**Files to Create:**
1. `components/theme-provider.tsx` - next-themes wrapper

**Dependencies to Install:**
1. `next-themes` - Theme management

---

## Accessibility Notes

**Team Logos:**
- Maintain `aria-label` and `title` attributes
- Ensure 4.5:1 contrast ratio (WCAG AA)

**Theme Selector:**
- Keyboard navigable (tab through options)
- Focus visible (ring on selected)
- Screen reader announces current theme

**Column Alignment:**
- No impact on accessibility
- Improves visual clarity for low-vision users

---

**All recommendations follow WCAG 2.1 Level AA standards and 2024-2025 mobile UX best practices.**
