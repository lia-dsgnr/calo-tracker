# Product Scope: Food Search, Manual Entry & Favorites

## Goal

Enable users to find and log any meal quickly by searching the Vietnamese food database, entering custom foods manually, and saving frequently-eaten items as favorites — reducing logging time from 30+ seconds to under 15 seconds for repeat meals.

---

## Target Users

| User | Role | Context |
|------|------|---------|
| **Primary:** Linh (Young Professional) | Office worker, 25-32 | Eats at regular restaurants, needs one-tap logging for repeat meals, low tolerance for friction |
| **Secondary:** My (Eat-Clean Student) | Health-conscious student | Wants accuracy and trusted data, logs diverse meals, values Vietnamese portions |
| **Secondary:** Trang (Busy Intern) | Time-constrained intern | Eats out frequently, will abandon if logging takes >30 seconds |

---

## Features Included

### Core (MVP)

1. **Food Search**
   - Search bar with instant filtering (as-you-type)
   - Search by Vietnamese name (`name_vi`) and English name (`name_en`)
   - Display matching results with kcal and portion info
   - Empty state when no results found

2. **Search Results Display**
   - Show food name (bilingual), calories, protein per portion
   - Tap result → opens portion picker (existing S/M/L flow)
   - Recent searches: last 5 search terms persisted

3. **Manual Text Entry + Custom Foods**
   - "Can't find your food?" option below search results
   - Simple form: food name, calories (required), protein/carbs/fat (optional)
   - Save to log immediately with timestamp
   - Option to "Save as custom food" for reuse (max 30 custom foods)
   - Custom foods: single fixed calorie value (no S/M/L portions)
   - Custom foods appear in search results alongside database foods
   - Users can edit custom food values or delete custom foods
   - Custom foods can be added to Favorites (separate lists)

4. **Favorites List**
   - Heart icon on food tiles and search results to add/remove favorite
   - Favorites tab/section on Quick Add screen
   - Maximum 20 favorites (FIFO if exceeded)
   - Favorites persist in localStorage

5. **Recent Items Enhancement**
   - Extend existing "Recent" to include manually-entered foods
   - Show source indicator (database vs manual entry)

### Enhanced (if time permits)

1. **Smart Search Suggestions**
   - Show popular foods when search is empty
   - "Did you mean?" for typos/close matches

2. **Favorites Reordering**
   - Drag-and-drop to reorder favorites
   - Pin top 3 favorites to Quick Add grid

---

## Out of Scope

| Excluded | Rationale |
|----------|-----------|
| User accounts / authentication | CR #1 dependency — not yet implemented |
| Cloud sync of favorites | Requires backend — localStorage only for MVP |
| Barcode scanning | Separate feature initiative (CR #3 adjacent) |
| Nutritional details beyond kcal/protein/carbs/fat | MVP focuses on core metrics only |
| Food database expansion (beyond 50 items) | Separate data initiative |
| Edit/delete manually-entered foods after logging | Can delete via meal list; editing is Phase 2 |
| Favorites categories/folders | Complexity — flat list for MVP |

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search-to-log time | < 15 seconds for database foods | Manual testing, future analytics |
| Favorites usage | 30% of active users save ≥1 favorite within first week | localStorage analysis |
| Manual entry adoption | 10% of logs use manual entry | Log source tracking |
| Search abandonment | < 20% searches with no selection | Future analytics |
| Task completion | 95% of search attempts result in logged meal | Usability testing |

---

## Risks & Constraints

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Search performance on 50+ items | Low | Medium | Client-side filtering is fast; test with 200+ items |
| Users enter wildly inaccurate manual calories | Medium | Medium | Show "estimated" badge; future: suggest similar foods |
| Favorites list becomes stale/unused | Medium | Low | Show favorites prominently; track usage for iteration |
| Confusing UX between Quick Add tiles and Search | Medium | High | Clear visual hierarchy; search is secondary to tiles |

### Constraints

| Constraint | Impact |
|------------|--------|
| No backend/API | All data in localStorage; no cross-device sync |
| 50-item food database | Limited search results; manual entry compensates |
| Bilingual UI requirement | Search must handle both Vietnamese and English |
| Mobile-first (360px min) | Search input and results must be thumb-friendly |

---

## Dependencies

- Existing Quick Add flow (portion picker, toast with undo)
- Existing localStorage schema (`calo_logs`, `calo_recent`)
- `foods.json` dataset with `name_vi`, `name_en`, nutritional data
- CR #1 (Account Management) is **not required** — favorites stored locally

---

## Resolved Questions

| Question | Decision |
|----------|----------|
| Manual entries reusable? | **Yes** — save as "custom foods" for reuse |
| localStorage cleanup strategy? | **Yes** — implement cleanup when approaching limits |
| Search priority: VN vs EN? | **Both** — treat Vietnamese and English equally |
| Show kcal on favorites tiles? | **Yes** — display calories/protein on favorites |
| Custom foods limit? | **30 max** — single fixed calorie value (no portions) |
| Custom foods editing? | **Yes** — users can edit values or delete |
| Custom foods macros? | **Optional** — protein, carbs, fat (calories required) |
| Favorites vs Custom Foods? | **Separate** — custom foods can be added to favorites |
| Cleanup strategy? | **Prompt user** — show dialog when approaching limits |
| Search ranking? | **Exact match first → alphabetical** |
| Custom food at limit? | **Show error** — display message when at 30 custom foods |

---

## Diagram

*No Creately diagram yet. Create one at creately.com and add link here.*

<!-- Replace with actual Creately diagram link after creating the visual -->
