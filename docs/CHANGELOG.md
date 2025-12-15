# Change Log

## 2025-12-15

### Manual Entry Feature Integration
Integrated manual food entry functionality into the QuickAdd UI, allowing users to log foods not found in the database.

#### Manual Entry Modal (`src/components/QuickAdd/ManualEntryModal.tsx`)
- Bottom sheet form for manual food entry with name, calories, and optional macros (protein, carbs, fat)
- Validation for required fields and numeric inputs
- High-calorie warning (>5000 kcal) with confirmation prompt
- "Save as custom food" checkbox (checked by default) with limit checking (30 max)
- Pre-fills food name from search query when available
- Success toast with undo option and custom food save confirmation

#### QuickAddPage Integration
- Added manual entry modal state management
- Integrated with search results ("Can't find your food?" link)
- Handles custom food creation, logging, and conditional soft-deletion
- Shows success messages with custom food save status
- Pre-fills name from search query (even when results exist)

#### Database Integration
- Creates custom food entries for manual logs (required for foodId in log table)
- Soft-deletes custom food if "Save as custom" is unchecked (preserves foodId in log)
- Handles edge case E7: logs meal even when at 30 custom food limit

### Custom Foods in Food Grid
Added custom foods display to the main food grid as a new "My Dishes" category.

#### FoodTileGrid Updates
- Added `customFoods` prop to accept custom food items
- New "My Dishes" section displayed before category sections
- Custom foods show with "Custom" badge and `foodType="custom"` for proper favorite handling
- Recent section now includes both system and custom foods
- Hidden Recent section for "All" tab (only shows in "Recent" tab)

#### QuickAddPage Updates
- Converts custom foods to FoodItem format (single portion, same values for S/M/L)
- Passes custom foods to FoodTileGrid
- Updated `handleSelectFood` to open portion picker for custom foods (single "1 serving" button)
- Custom foods in Recent section display with proper foodType and badges

### Portion Picker Enhancements
Enhanced portion picker to show complete nutrition information and support custom foods.

#### PortionPicker Updates
- Added `isCustomFood` prop to identify custom foods
- Auto-detects custom foods by checking if all portions (S/M/L) are identical
- Custom foods show single "1 serving" button instead of S/M/L options
- Displays protein, carbs, and fat information for all foods
- Format: "P: Xg • C: Yg • F: Zg" below calories
- Updated `handleSelectPortion` to handle custom foods via `logCustomFood`

### UX Improvements
- Manual entry checkbox checked by default to encourage saving for reuse
- Recent section shows custom foods with "Custom" badge
- Consistent interaction pattern: custom foods open portion picker (single button) like system foods
- Complete nutrition info visible in portion picker for better decision-making

---

## 2025-12-12

### Design System Integration
Integrated a new wellness-inspired design system with comprehensive color tokens, typography, and visual guidelines.

#### Color System (`tailwind.config.js`)
- Added 6 color families with 10-100 shade scales:
  - **Mindful Brown** (`brown-10` to `brown-100`) — primary neutrals, titles, icons
  - **Optimistic Gray** (`gray-10` to `gray-100`) — backgrounds, dividers, disabled states
  - **Serenity Green** (`green-10` to `green-100`) — success, healthy range, CTAs
  - **Empathy Orange** (`orange-10` to `orange-100`) — warnings, calorie highs, charts
  - **Zen Yellow** (`yellow-10` to `yellow-100`) — highlights, badges, attention cues
  - **Kind Purple** (`purple-10` to `purple-100`) — accents, achievements
- Added semantic token aliases mapping to pure colors:
  - `primary` → green-60, `secondary` → orange-60, `tertiary` → purple-60
  - `background` → gray-10, `foreground` → brown-90, `border` → gray-20

#### Typography
- Changed font family from Inter to **Nunito Sans**
- Increased font sizes for mobile readability:
  - `h1`: 32px, `h2`: 24px, `h3`: 20px
  - `body-lg`: 18px, `body`: 16px, `caption`: 14px
  - `numeric-lg`: 28px, `numeric`: 20px
- Added legacy aliases (`headline`, `title`) for backward compatibility

#### Component Updates
- `CarbsBar.tsx` — Changed gradient from `amber-*` to `yellow-60`/`yellow-50` (Zen Yellow)
- `FatBar.tsx` — Changed gradient from `rose-*` to `purple-60`/`purple-50` (Kind Purple)

#### Shadows
- Softened all shadows (0-4px blur, lower opacity) using brown-90 as base color

#### Documentation
- Added `docs/design-system-integration-plan.md` — Implementation plan with impact assessment, risk analysis, and testing checklist

---

### SQLite Database Implementation
Migrated from localStorage to SQLite (sql.js WASM) for improved data management and future scalability.

#### New Database Module (`src/db/`)
- `connection.ts` — sql.js connection manager with IndexedDB persistence
- `init.ts` — Schema creation and migration management
- `seed.ts` — Seeds system foods from `foods.json` into SQLite
- `migrate-localStorage.ts` — One-time migration utility from localStorage to SQLite
- `types.ts` — TypeScript types for all database entities
- `schema.sql` / `indexes.sql` — SQL schema reference files

#### Database Schema (7 tables)
- `user_profile` — User accounts and daily goals (max 10 users for testing)
- `system_food` — Curated Vietnamese food database with S/M/L portions + extended nutrients
- `custom_food` — User-created foods (max 30 per user, single portion)
- `food_log` — Meal entries with 30-day retention, 30 items/day limit
- `favorite` — User favorites (max 20 per user)
- `recent_search` — Last 5 search terms per user (FIFO)
- `daily_summary` — Pre-computed daily aggregates for statistics

#### Repository Layer (`src/db/repositories/`)
- `user-repository.ts` — CRUD for user profiles
- `food-repository.ts` — System foods + custom foods queries
- `log-repository.ts` — Food logging with daily summaries
- `favorite-repository.ts` — Favorites management with toggle support
- `search-repository.ts` — Recent search terms
- `stats-repository.ts` — Weekly/monthly summaries, trends, streaks

#### React Integration (`src/contexts/`, `src/hooks/`)
- `useDatabase.ts` — Hook for database lifecycle management
- `DatabaseProvider` — Context provider with loading/error states
- `useDatabaseContext` / `useCurrentUser` — Hooks to access database context

#### Dependencies Added
- `sql.js` — SQLite compiled to WASM for browser
- `uuid` — UUID generation for primary keys
- `date-fns` — Date manipulation for queries
- `@types/sql.js` — TypeScript definitions

#### Capacity Limits
- 10 local user accounts
- ~500 KB per user, ~3.75 MB total for 10 users
- 30-day log retention, 90-day summary retention

### Bug Fixes
- Fixed database initialization hanging in React StrictMode
  - Root cause: `hasStartedRef` guard prevented re-initialization on second mount
  - Solution: Removed ref guard; `isMounted` pattern handles cleanup correctly

### Product Scope
- Added `artifacts/SCOP251211-food-search-favorites.md` — Scope document for Food Search, Manual Entry & Favorites feature

---

## 2025-12-11

### Design Process Framework (DPA)
- Created `.claude/skills/README.md` — Full design process framework for AI-assisted product development
  - 4 phases: Discover → Define → Explore → Deliver
  - Mermaid flowchart visualising artifact dependencies
  - Entry points by work type (New Feature, Redesign, Enhancement, Bug Fix)
  - Feedback loop documentation for iterative updates

### Skills Library
New skills added to `.claude/skills/`:
- `SKILL.md` — Decision Log skill (track design decisions with rationale)
- `0.0-project-init-skill.md` — Project initialisation
- `0.0-rfp-to-planning.md` — RFP to planning workflow
- `1.1-competitive-analysis.md` — Competitor analysis framework
- `1.1-competitive-analysis-claude-ai-instructions.md` — AI prompts for competitive analysis
- `1.2-jtbd-skill.md` — Jobs-to-be-Done framework
- `1.2-research-synthesis-skill.md` — Research synthesis workflow
- `1.2-user-persona-skill.md` — User persona generation
- `2.1-feature-list-skill.md` — Feature list from scope documents
- `2.1-scope-definition-skill.md` — Scope definition workflow
- `2.1-task-list-skill.md` — Task breakdown workflow
- `2.2-service-blueprint.md` + `.d2` — Service blueprint documentation

### Research & Personas
- Created research synthesis from 3 source documents:
  - `artifacts/RSYN251211-vietnam-calorie-tracker.md`
  - Key findings: Vietnamese food localisation gap, speed as competitive moat, AI underserved in VN market
- Created 4 user personas for Calo Tracker:
  - `PERS251211-a-young-professional.md` — Primary: Linh Nguyen (busy professional, one-tap logging, offline sync)
  - `PERS251211-b-health-conscious-student.md` — Secondary: Minh Tran (student, free tier, simple onboarding)
  - `PERS251211-c-fitness-enthusiast.md` — Tertiary: Khoa Pham (macros, custom recipes, Vietnamese portions)
  - `PERS251211-n-data-obsessed-optimizer.md` — Negative: The Biohacker (who we're NOT designing for)

### Product Documentation
- Added `docs/calorie-tracking-web-app.md` — Product brief with problem statement, business/user goals, target segments, and 10 change requests (feature roadmap)
- Added `docs/researches/` folder with competitive research:
  - `competitor-overview.md` — 6 competitors analysed (MyFitnessPal, YAZIO, FatSecret, HealthifyMe, Wao, Caloer)
  - `strategic-insights.md` — Market positioning insights
  - `user-insights.md` — User research findings

### Documentation
- Added three new artifact types to `docs/guides/naming-conventions.md`:
  - `PRD` — Product Requirement Document
  - `DATA` — Sample Data
  - `TEST` — Testing Plan
- Updated quick reference codes list (alphabetically sorted)

### Skills Updates
- Updated `userflow.md` to follow naming conventions:
  - Changed save path from `docs/artifacts/userflows/` to `artifacts/`
  - Changed naming pattern from `YYYY-MM-DD-[job]-[approach].d2` to `FLOW[YYMMDD]-[slug].d2`
  - Updated validation checklist to reference correct path

---

## 2025-12-10

### Dashboard Integration
- Integrated Dashboard and QuickAdd into a single unified view in `App.tsx`
- Dashboard now shows daily progress (calorie ring) with QuickAdd food grid below

### Macro Tracking (Carbs & Fat)
- Added `carbs` and `fat` fields to `LogEntry` type
- Added `consumedCarbs` and `consumedFat` to `DailySummary` type
- Added `dailyCarbs` (200g) and `dailyFat` (60g) to `DailyGoals` with defaults
- Created `CarbsBar` component (amber gradient)
- Created `FatBar` component (rose gradient)
- Updated `DailySummary` to display all three macro progress bars
- Added migration function `migrateLogs()` to backfill carbs/fat for existing log entries

### UI Improvements
- Set max-width of 1000px for body content on desktop
- Widened PortionPicker buttons (100px → 140px) and increased bottom padding
- Fixed `safe-bottom` utility to use margin instead of padding (no longer overrides `pb-*`)
- Added `PlusCircle` icon to `FoodTile` for clearer add action
- Centred delete icon in `MealCard` with flex alignment
- Simplified `MealCard` delete to single-click (removed double-confirmation)

### Bug Fixes
- Fixed goals merge to include defaults for missing `dailyCarbs`/`dailyFat` in legacy localStorage data

