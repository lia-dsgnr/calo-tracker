# Change Log

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

