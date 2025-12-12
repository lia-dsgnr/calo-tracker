# Change Log

## 2025-12-12

### Food Search Feature
Implemented Vietnamese-optimized food search with accent-insensitive matching, fuzzy search, and recent searches.

#### New Components (`src/components/QuickAdd/`)
- `SearchInput.tsx` — Debounced search input with clear button, loading spinner, and Vietnamese character support
- `SearchResults.tsx` — Results list with match highlighting, recent searches panel, and empty states

#### Search Utilities (`src/lib/search.ts`)
- Vietnamese accent normalization (`normalizeVietnamese`) — Maps 60+ Vietnamese characters to ASCII (e.g., "Phở bò" → "pho bo")
- Fuzzy matching with Levenshtein distance — Handles typos (max distance: 1) for queries ≥5 characters
- Relevance scoring — Prefix matches (100 VI / 90 EN) > Contains (50) > Fuzzy (20)
- Query sanitization — Strips special characters, limits to 50 characters

#### Search Features
- **Bilingual search** — Matches Vietnamese (`name_vi`) and English (`name_en`) food names
- **Match highlighting** — Highlighted text segments in orange (`orange-40`) for matched portions
- **Recent searches** — Last 5 search terms saved per user (FIFO), with delete/clear all actions
- **Loading states** — Skeleton UI during search, loading spinner in input

#### QuickAdd Integration
- Updated `QuickAddPage.tsx` with search state management
- Search results overlay replaces food grid when focused or query entered
- Auto-saves search term on food selection or Enter key
- Seamless transition between search results and tile grid

---

### Documentation Reorganization
Restructured documentation for better organization.

#### File Moves
- `docs/` → `artifacts/` for product docs:
  - `DATA251210-sample-data-sets.md`
  - `FEAT251210-dashboard-quick-add.md`
  - `PRD251210-product-spec-summary.md`
  - `RMAP251211-calorie-tracking-web-app.md`
- `artifacts/*.PERS*.md` → `artifacts/personas/` (4 persona files + SVGs)

#### New Files
- `artifacts/PLAN251212-food-search.md` — Food search implementation plan
- `docs/food_search_userflow.d2` — User flow diagram for search feature
- `docs/data-dependencies.md` — Data flow documentation

---

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

