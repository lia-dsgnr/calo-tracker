# Change Log

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

