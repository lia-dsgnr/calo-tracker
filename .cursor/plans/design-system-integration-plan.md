# Design System Integration Plan

## Summary
Replace existing Tailwind design tokens with new wellness-inspired design system (Mindful Brown, Optimistic Gray, Serenity Green, Empathy Orange, Zen Yellow, Kind Purple) + Nunito Sans font. Infrastructure only - components unchanged.

**Status: ✅ Completed**

---

## Files Modified

| File | Changes |
|------|---------|
| `tailwind.config.js` | Replace colors, update font, typography, shadows |
| `src/index.css` | Update font import (Inter → Nunito Sans), update CSS variables |

---

## Implementation Steps

### Step 1: Update Font Import ✅
**File:** `src/index.css`

Replace Inter with Nunito Sans:
```css
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&display=swap');
```

### Step 2: Replace Color Tokens ✅
**File:** `tailwind.config.js`

Add 6 color families (10-100 scales) + semantic aliases:

**Layer 1 - Pure Colors:**
- `brown-10` to `brown-100` (Mindful Brown)
- `gray-10` to `gray-100` (Optimistic Gray)
- `green-10` to `green-100` (Serenity Green)
- `orange-10` to `orange-100` (Empathy Orange)
- `yellow-10` to `yellow-100` (Zen Yellow)
- `purple-10` to `purple-100` (Kind Purple)

**Layer 2 - Semantic Aliases:**
- `primary` → green-60 (CTAs, success)
- `secondary` → orange-60 (highlights, warnings)
- `tertiary` → purple-60 (accents)
- `background.DEFAULT` → gray-10
- `foreground.DEFAULT` → brown-90
- `foreground.muted` → gray-60
- `border` → gray-20
- `success` → green-60
- `warning` → orange-60

### Step 3: Update Typography ✅
**File:** `tailwind.config.js`

Font family and scale optimized for mobile readability:

```javascript
fontFamily: {
  sans: ['Nunito Sans', 'system-ui', 'sans-serif'],
},
fontSize: {
  // New design system scale - optimized for mobile readability
  'h1': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],         // 32px
  'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],         // 24px
  'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],     // 20px
  'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 18px
  'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],       // 16px
  'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
  'numeric-lg': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 28px
  'numeric': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px

  // Legacy aliases for backward compatibility
  'headline': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],   // 32px
  'title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 20px
}
```

### Step 4: Update Shadows ✅
**File:** `tailwind.config.js`

Softer shadows (0-4px blur, low opacity):
```javascript
boxShadow: {
  'card': '0 2px 4px rgba(55, 35, 21, 0.04)',
  'sheet': '0 -2px 8px rgba(55, 35, 21, 0.06)',
  'tile': '0 1px 3px rgba(55, 35, 21, 0.05)',
}
```

### Step 5: Update CSS Variables ✅
**File:** `src/index.css`

Updated `:root` variables to match new tokens.

---

## Impact Assessment

### Backward Compatible (Auto-updates)
- `text-foreground`, `text-foreground-muted` - new values
- `bg-background`, `bg-background-card` - new values
- `text-primary`, `bg-primary` - new values
- `rounded-card`, `rounded-pill`, `rounded-sheet` - unchanged
- `shadow-card`, `shadow-tile`, `shadow-sheet` - softer values
- `text-headline`, `text-title` - legacy aliases provided

### Breaking (Phase 2 - ✅ Completed)
| Issue | Files | Resolution |
|-------|-------|------------|
| Tailwind `amber-*` colors | CarbsBar.tsx | Replaced with `yellow-60`/`yellow-50` |
| Tailwind `rose-*` colors | FatBar.tsx | Replaced with `purple-60`/`purple-50` |
| `tertiary` structure | MealCard.tsx | Already compatible (no changes needed) |

### Visual Changes (Automatic)
- Font changes from Inter to Nunito Sans
- Larger, more legible typography scale for mobile
- Warmer, earthier color palette
- Softer shadow appearance
- Slightly different background tone

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Font loading failure | Low | Medium | system-ui fallback |
| Color contrast issues | Medium | High | Test with accessibility tools |
| Build failure | Low | High | Run `npm run build` after changes |
| Visual regression | High | Medium | Screenshot before/after |

### Known Issue
`gray-50` in color-tokens.md shows `#9B2B86` (magenta) - likely typo. Used interpolated value `#8A8680`.

---

## Testing Plan

### 1. Pre-Implementation
- [x] Screenshot current UI state
- [x] Verify Nunito Sans font on Google Fonts

### 2. Build Verification ✅
```bash
npm run build  # Passed
npm run lint   # 1 pre-existing error (unrelated to design system)
```

### 3. Visual Inspection
- [ ] Dashboard: ProgressRing, macro bars, meal cards
- [ ] QuickAdd: Food tiles, portion picker
- [ ] Toast notifications
- [ ] Text readability (primary + muted)
- [ ] Focus states and touch targets

### 4. Accessibility Checks
| Element | Colors | Target |
|---------|--------|--------|
| Primary text | brown-90 on gray-10 | 4.5:1+ |
| Muted text | gray-60 on gray-10 | 4.5:1+ |
| Primary button | white on green-60 | 4.5:1+ |

---

## Phase 2: Component Updates ✅

### Completed
- [x] CarbsBar.tsx - `amber-*` → `yellow-60`/`yellow-50` (Zen Yellow)
- [x] FatBar.tsx - `rose-*` → `purple-60`/`purple-50` (Kind Purple)
- [x] MealCard.tsx - tertiary tokens already compatible
- [x] Build verification passed

### Future Improvements (Optional)
- Adopt new typography classes (`text-h1`, `text-h2`, `text-body-lg`)
- Add more semantic color usage in other components
