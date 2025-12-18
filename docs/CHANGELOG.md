# Change Log

## 2025-12-18

### Favorites Grid UI Redesign
- **Grid Layout**: Transformed favorites from vertical list to responsive grid (2 columns mobile, 3 columns tablet+)
- **FavoriteCard Component**: New grid card component displaying:
  - Category emoji icon (centered at top)
  - Food name and calories
  - Usage count badge (top-left, e.g., "3x", "10x")
  - Heart icon (top-right) in empathy orange to remove from favorites
- **Removed Edit Mode**: Simplified UI by removing edit mode; heart icon directly removes items
- **Heart Icon Styling**: Changed heart icon color to empathy orange (`orange-60`) when favorited

### Suggestions Grid Updates
- **Matching Design**: Updated suggestion tiles to match FavoriteCard grid layout and styling
- **Icon Changes**: 
  - Replaced Zap (quick-log) icon with X (remove) icon
  - Swapped positions: remove icon (X) in top-left, heart icon in top-right
- **Hide Functionality**: Added ability to hide individual suggestions (persisted in localStorage)
- **Favorited State**: Heart icon shows filled with empathy orange when item is favorited
- **Persistent Suggestions**: Items remain in suggestions list after being favorited (not removed)

### Analytics
- Added `quickadd_favorites_removed_all` event for tracking bulk removal
- Added `quickadd_suggestion_hidden` event for tracking individual suggestion hiding

### Templates Section (Temporarily Disabled)
- Removed the TemplatesSection and TemplateEditorSheet from the Quick Add page UI to avoid exposing a half-implemented templates flow during this iteration.
- Kept the underlying template repository, hooks, and types intact so templates can be re-enabled later without data migration or schema changes.

### Quick Add Food Search
- **Inline Search Bar**: Added a reusable `SearchInput` component and `FoodSearchBar` wrapper, placing search inline with the `Quick Add` heading and auto-focusing on page load so users can start typing immediately.
- **Grouped Results**: Implemented `useFoodSearch` hook and `FoodSearchResults` UI to surface results in three groups that respect \"my food first\" ordering: Favourite Foods, Recently Logged, and All Foods, each collapsible after five items.
- **Result Rows**: Introduced `ListItem`, `SectionHeader`, `Badge`, and `FoodSearchResultItem` so every row shows emoji, name with subtle match highlighting, source label (\"Your food\" / \"Global database\"), and a heart icon to add or remove favourites directly from search.
- **Empty / First-Time States**: Added first-time helper text plus an informative \"No results yet\" state with a mocked \"Add custom food\" call-to-action so users are never met with a blank screen.
- **Interaction & Analytics**: Tapping a result still routes through the Portion Picker, and a new `search_food_selected` analytics event tracks which foods are chosen from search and with what query.

### Timeline Tabs & Visual Refresh
- **Tabbed Timeline**: Reworked `useTimeline` to power a tabbed timeline (Today, Yesterday, weekday tabs, Older) and added `TimelineTabs` so users can jump between recent days instead of scrolling a long list.
- **Timeline Layout**: Updated `TimelineSection` to render logs along a vertical timeline with dots and cards offset from the line, matching the new design and making the logging history easier to scan.
- **Timeline Card Simplification**: Simplified `TimelineCard` into a compact, non-expandable card focused on emoji, meal name, time, calories, and a single \"Log again\" action to keep the flow fast.

---

## 2025-12-17

### Research & Problem Framing
- Added `docs/CHAT251216-food-search-problem-framing.md` to reframe food search drop-offs (recognition vs recall) with risk-assessed assumptions and six solution approaches.
- Highlights high-risk hypotheses (meal repetition, consistent naming, near-mealtime logging) to validate before committing to build.

### Competitive Landscape
- Simplified `docs/researches/competitor-overview.md` by removing CTA footer to keep the competitive scan focused on facts and sources.

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

