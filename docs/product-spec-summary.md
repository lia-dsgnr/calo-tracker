# Calo Tracker — Product Spec Summary

## Product Vision

A fast, culturally relevant, low-friction calorie-tracking companion for young people in urban Vietnam. Helps users stay consistent, build self-awareness, and hit fitness goals without guilt.

---

## MVP Goals

1. Log common Vietnamese meals in **<10 seconds** (2 taps)
2. Show daily calorie & protein progress at a glance
3. Data stored locally (JSON + localStorage)

---

## MVP Scope

### In Scope

- Quick Add with Vietnamese street food tiles
- S/M/L portion selection (auto-generated: 0.7x / 1.0x / 1.3x multipliers)
- Daily Dashboard with progress ring and protein bar
- Meal list with swipe-to-delete
- Toast notifications with undo
- localStorage persistence
- Bilingual UI (Vietnamese dish names, English labels)

### Out of Scope (Non-MVP)

- No backend DB or API integration
- No user accounts / login
- No push notifications or cron jobs
- No real-time syncing or multi-device persistence
- No server-side weekly summary

---

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS 3.0 + Shadcn UI
- localStorage for persistence

---

## Data Model

### Food Database

50-item Vietnamese street food dataset with:

- `name_vi`, `name_en`
- `kcal`, `protein`, `fat`, `carbs` (per portion)
- S/M/L variants generated via multipliers

### localStorage Schema

| Key | Description |
|-----|-------------|
| `calo_logs` | Array of log entries (id, foodId, portion, kcal, protein, timestamp) |
| `calo_recent` | Last 8 unique food IDs |
| `calo_goals` | Daily targets (1800 kcal, 75g protein — mocked) |

---

## Feature 1: Quick Add

**Core Flow** (2 taps):

1. Tap food tile → Portion picker slides up
2. Select S/M/L → Toast confirms, log saved

**Key Behaviors**:

- 200ms debounce on tile tap
- Undo stores last log in memory
- Recent items: max 8, sorted by last-logged, deduplicated
- Most Used: top 5 items from rolling 7-day window

---

## Feature 2: Daily Dashboard

**Components**:

- Progress Ring (animated, <700ms)
- Protein Bar (horizontal)
- Daily Summary (consumed / remaining)
- Meal List (chronological, collapsible after 6 items)

**Key Behaviors**:

- Day resets at local midnight
- Exceeded goal shows "+xxx kcal" (neutral color)
- Empty state with illustration and prompt

---

## Visual Design System

### Color Palette

| Role | Color |
|------|-------|
| Primary | Sage/olive green — CTAs, progress, positive states |
| Secondary | Warm coral/orange — highlights, secondary emphasis |
| Tertiary | Soft lavender — supporting cards/badges |
| Background | Warm cream (#FAF8F5 range) |
| Surface | White with soft shadow |
| Text Primary | Dark brown/charcoal |
| Text Secondary | Muted taupe |

**Rule**: Never use red for kcal/protein values (avoid guilt). Red only for true errors.

### Typography

| Element | Style |
|---------|-------|
| Headlines | 28–32px, bold, rounded sans |
| Body | 14–16px, regular |
| Captions | 12px, muted color |

### Spacing & Layout

- Screen padding: 16–20px
- Card padding: 16–20px
- Section gaps: 24px
- Border radius: 16–24px for cards; full for pills/FABs
- Mobile-first: 360px min, touch targets ≥ 44px

### Component Patterns

- **Cards**: Rounded, subtle diffuse shadow
- **Progress Ring**: Thick stroke, large centered number
- **Bars**: Rounded caps, soft gradient
- **Pills**: Fully rounded for filters/toggles
- **FAB**: Circular primary button
- **Bottom Sheet**: Rounded top corners, slides from bottom
- **Toast**: Semi-transparent, auto-hide 2s, undo button

---

## Reference Documents

- `003-dashboard-quick-add.md` — Full behavior spec for Quick Add and Dashboard
- `300-sample-data-sets.md` — 50-item Vietnamese food dataset

---

## Implementation Todos

1. Scaffold Vite + React + TypeScript + Tailwind + Shadcn
2. Create `foods.json` with S/M/L portions and TypeScript types
3. Implement localStorage hooks and helpers
4. Build Quick Add (tiles, portion picker, toast with undo)
5. Build Dashboard (ring, bar, summary, meal list with swipe-to-delete)
6. Wire up integration and edge cases
