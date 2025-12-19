# Calo Tracker — Product Spec Summary

## Product Vision

A fast, culturally relevant, low-friction calorie-tracking companion for young people in urban Vietnam. Helps users stay consistent, build self-awareness, and hit fitness goals without guilt.

---

## MVP Goals

1. Log common Vietnamese meals in **<10 seconds** (2 taps)
2. Show daily calorie & protein progress at a glance
3. Data stored locally (SQLite via sql.js WASM)

---

## MVP Scope

### In Scope

| Feature | Status |
|---------|--------|
| Quick Add with Vietnamese street food tiles | ✅ Done |
| S/M/L portion selection | ✅ Done |
| Daily Dashboard with progress ring and macro bars | ✅ Done |
| Meal list with swipe-to-delete | ⚠️ Pending |
| Toast notifications with undo | ✅ Done |
| SQLite persistence (upgraded from localStorage) | ✅ Done |
| Bilingual UI (Vietnamese dish names, English labels) | ✅ Done |

### Out of Scope (Non-MVP)

- No backend DB or API integration
- No user accounts / login
- No push notifications or cron jobs
- No real-time syncing or multi-device persistence
- No server-side weekly summary

---

## Tech Stack

| Technology | Version | Status |
|------------|---------|--------|
| React | 19.2.0 | ✅ Implemented |
| TypeScript | 5.9.3 | ✅ Implemented |
| Vite | 7.2.4 | ✅ Implemented |
| Tailwind CSS | 3.4.18 | ✅ Implemented |
| Shadcn UI | - | ✅ Implemented |
| sql.js (SQLite WASM) | 1.13.0 | ✅ Implemented |
| date-fns | 4.1.0 | ✅ Implemented |
| uuid | 13.0.0 | ✅ Implemented |

---

## Data Model

### Food Database

50+ item Vietnamese street food dataset (`src/data/foods.json`) with:

- `id` — unique identifier (kebab-case)
- `name_vi`, `name_en` — bilingual names
- `category` — food category (noodles, rice, etc.)
- `portions` — S/M/L with `kcal`, `protein`, `fat`, `carbs`
- `serving` — human-readable serving size
- `confidence` — data accuracy score

### SQLite Schema (7 tables)

| Table | Description |
|-------|-------------|
| `user_profile` | User accounts and daily goals (max 10 users) |
| `system_food` | Curated Vietnamese food database with S/M/L portions |
| `custom_food` | User-created foods (max 30 per user) |
| `food_log` | Meal entries with 30-day retention |
| `favorite` | User favorites (max 20 per user) |
| `recent_search` | Last 5 search terms per user (FIFO) |
| `daily_summary` | Pre-computed daily aggregates |

**Capacity Limits:**
- 10 local user accounts
- ~500 KB per user, ~3.75 MB total
- 30-day log retention, 90-day summary retention

---

## Feature 1: Quick Add

**Status:** ✅ Implemented

**Components:**
- `FoodTile.tsx` — Individual food item tile
- `FoodTileGrid.tsx` — Grid layout for food tiles
- `PortionPicker.tsx` — S/M/L portion selector
- `QuickAddPage.tsx` — Main Quick Add view

**Core Flow** (2 taps):

1. Tap food tile → Portion picker slides up
2. Select S/M/L → Toast confirms, log saved

**Key Behaviors**:

- 200ms debounce on tile tap
- Undo stores last log in memory
- Recent items: max 5, sorted by last-logged (via `recent_search` table)
- Most Used: top 5 items from rolling 7-day window

---

## Feature 2: Daily Dashboard

**Status:** ✅ Implemented

**Components:**

| Component | File | Status |
|-----------|------|--------|
| Progress Ring | `ProgressRing.tsx` | ✅ Done |
| Protein Bar | `ProteinBar.tsx` | ✅ Done |
| Carbs Bar | `CarbsBar.tsx` | ✅ Done (extra) |
| Fat Bar | `FatBar.tsx` | ✅ Done (extra) |
| Macro Bar | `MacroBar.tsx` | ✅ Done (extra) |
| Daily Summary | `DailySummary.tsx` | ✅ Done |
| Meal List | `MealList.tsx` | ✅ Done |
| Meal Card | `MealCard.tsx` | ✅ Done |

**Key Behaviors**:

- Day resets at local midnight
- Exceeded goal shows "+xxx kcal" (neutral color)
- Empty state with illustration and prompt

---

## Feature 3: Food Log (Planned)

**Status:** ❌ Not Started

**Location:** `src/components/FoodLog/` (empty)

**Planned Features:**
- Full meal history view
- Search and filter logged meals
- Edit/delete past entries

---

## Feature 4: Settings (Planned)

**Status:** ❌ Not Started

**Location:** `src/components/Settings/` (empty)

**Planned Features:**
- Daily calorie/macro goals
- User profile management
- Data export/import

---

## Visual Design System

**Status:** ✅ Implemented in `tailwind.config.js`

### Color Palette

| Role | Color Scale | Tailwind Class |
|------|-------------|----------------|
| Primary | Serenity Green | `green-10` to `green-100` |
| Secondary | Empathy Orange | `orange-10` to `orange-100` |
| Tertiary | Kind Purple | `purple-10` to `purple-100` |
| Neutral | Mindful Brown | `brown-10` to `brown-100` |
| Background | Optimistic Gray | `gray-10` (#F5F5F5) |
| Text Primary | Brown-90 | `brown-90` |
| Text Secondary | Gray-60 | `gray-60` |
| Highlights | Zen Yellow | `yellow-10` to `yellow-100` |

**Rule**: Never use red for kcal/protein values (avoid guilt). Red only for true errors.

### Typography

| Element | Style |
|---------|-------|
| Headlines (h1) | 32px, bold, Nunito Sans |
| Title (h2) | 24px, bold |
| Subtitle (h3) | 20px, semibold |
| Body | 16px, regular |
| Caption | 14px, muted color |

### Spacing & Layout

- Screen padding: 16–20px
- Card padding: 16–20px
- Section gaps: 24px
- Border radius: 16–24px for cards; full for pills/FABs
- Mobile-first: 360px min, touch targets ≥ 44px

### Component Patterns

| Pattern | Description | Status |
|---------|-------------|--------|
| Cards | Rounded, subtle diffuse shadow | ✅ |
| Progress Ring | Thick stroke, large centered number | ✅ |
| Bars | Rounded caps, soft gradient | ✅ |
| Pills | Fully rounded for filters/toggles | ✅ |
| FAB | Circular primary button | ⚠️ Pending |
| Bottom Sheet | Rounded top corners, slides from bottom | ✅ |
| Toast | Semi-transparent, auto-hide 2s, undo button | ✅ |

---

## Common Components

**Location:** `src/components/common/`

| Component | File | Status |
|-----------|------|--------|
| Toast | `Toast.tsx` | ✅ Done |

---

## Database Layer

**Location:** `src/db/`

| File | Purpose | Status |
|------|---------|--------|
| `connection.ts` | sql.js connection manager | ✅ Done |
| `init.ts` | Schema creation and migration | ✅ Done |
| `seed.ts` | Seeds foods from JSON | ✅ Done |
| `migrate-localStorage.ts` | One-time migration utility | ✅ Done |
| `types.ts` | TypeScript types for entities | ✅ Done |
| `schema.sql` | SQL schema reference | ✅ Done |
| `indexes.sql` | Database indexes | ✅ Done |

### Repositories (`src/db/repositories/`)

| Repository | Purpose | Status |
|------------|---------|--------|
| `user-repository.ts` | CRUD for user profiles | ✅ Done |
| `food-repository.ts` | System + custom foods | ✅ Done |
| `log-repository.ts` | Food logging with summaries | ✅ Done |
| `favorite-repository.ts` | Favorites management | ✅ Done |
| `search-repository.ts` | Recent search terms | ✅ Done |
| `stats-repository.ts` | Weekly/monthly stats | ✅ Done |

---

## Reference Documents

- `FEAT251210-dashboard-quick-add.md` — Full behavior spec for Quick Add and Dashboard
- `DATA251210-sample-data-sets.md` — 50-item Vietnamese food dataset

---

## Implementation Status

| # | Task | Status |
|---|------|--------|
| 1 | Scaffold Vite + React + TypeScript + Tailwind + Shadcn | ✅ Done |
| 2 | Create `foods.json` with S/M/L portions and TypeScript types | ✅ Done |
| 3 | Implement SQLite database layer (upgraded from localStorage) | ✅ Done |
| 4 | Build Quick Add (tiles, portion picker, toast with undo) | ✅ Done |
| 5 | Build Dashboard (ring, bars, summary, meal list) | ✅ Done |
| 6 | Wire up integration and edge cases | ⚠️ Partial |
| 7 | Build FoodLog feature | ❌ Not Started |
| 8 | Build Settings feature | ❌ Not Started |
| 9 | Implement swipe-to-delete on meal list | ❌ Not Started |

---

**Last Updated:** 2025-12-16
