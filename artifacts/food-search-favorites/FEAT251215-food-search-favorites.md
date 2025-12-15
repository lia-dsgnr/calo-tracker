---
type: feature-list
product: Calo Tracker
scope_ref: artifacts/SCOP251211-food-search-favorites.md
version: 1
---

# Feature List: Food Search, Manual Entry & Favorites

## Overview

**Goal:** Enable users to find and log any meal quickly by searching the Vietnamese food database, entering custom foods manually, and saving frequently-eaten items as favorites — reducing logging time from 30+ seconds to under 15 seconds for repeat meals.

**Target Users:**
- **Primary:** Linh (Young Professional) — Office worker, 25-32, needs one-tap logging for repeat meals
- **Secondary:** My (Eat-Clean Student) — Health-conscious, values accuracy and Vietnamese portions
- **Secondary:** Trang (Busy Intern) — Time-constrained, will abandon if logging takes >30 seconds

---

## P0 - Core (MVP)

| ID | Feature | Description | User Type | Dependencies | Status |
|----|---------|-------------|-----------|--------------|--------|
| F-001 | Food Search | Search bar with instant as-you-type filtering across Vietnamese (`name_vi`) and English (`name_en`) names; displays matching results with kcal and portion info; shows empty state when no results found | All users | `foods.json` dataset | Not Started |
| F-002 | Recent Searches | Persist and display last 5 search terms for quick re-search | Linh, Trang | F-001 | Not Started |
| F-003 | Manual Entry | "Can't find your food?" option allowing one-off food logging with name, calories (required), and optional protein/carbs/fat; saves to log immediately with timestamp | All users | Quick Add flow | Not Started |
| F-004 | Custom Foods | Save manually-entered foods for reuse (max 30); single fixed calorie value (no S/M/L portions); appears in search results alongside database foods | Linh, My | F-001, F-003 | Not Started |
| F-005 | Custom Food Management | Edit custom food values (name, calories, macros) or delete custom foods; show error message when at 30 custom food limit | All users | F-004 | Not Started |
| F-006 | Custom Food Limit Prompt | Display dialog when approaching custom food limit (30), prompting user to manage existing custom foods | All users | F-004, F-005 | Not Started |
| F-007 | Favorites List | Heart icon on food tiles and search results to add/remove favorites; dedicated Favorites tab/section on Quick Add screen; max 20 favorites with user prompt when limit reached | Linh, Trang | Quick Add flow | Not Started |
| F-008 | Favorites Persistence | Store favorites in localStorage; load on app start; support both database foods and custom foods as favorites (separate lists) | All users | F-007, localStorage schema | Not Started |
| F-009 | Favorites Limit Prompt | Display dialog when exceeding 20 favorites, prompting user to choose which favorite to remove | All users | F-007, F-008 | Not Started |
| F-010 | Recent Items Enhancement | Extend existing "Recent" section to include manually-entered foods; show source indicator (database vs manual entry) | All users | F-003, `calo_recent` schema | Not Started |

---

## P1 - Enhanced

| ID | Feature | Description | User Type | Dependencies | Status |
|----|---------|-------------|-----------|--------------|--------|
| F-011 | Smart Search Suggestions | Show popular foods when search input is empty; provide "Did you mean?" suggestions for typos/close matches | All users | F-001 | Not Started |
| F-012 | Favorites Reordering | Drag-and-drop to reorder favorites list; pin top 3 favorites to Quick Add grid for fastest access | Linh, Trang | F-007, F-008 | Not Started |

---

## P2 - Future (Out of Scope)

| ID | Feature | Rationale | Target Phase |
|----|---------|-----------|--------------|
| F-013 | User Authentication | CR #1 dependency — not yet implemented; required for cloud features | Phase 2 |
| F-014 | Cloud Sync Favorites | Requires backend infrastructure — localStorage only for MVP | Phase 2 |
| F-015 | Barcode Scanning | Separate feature initiative (CR #3 adjacent); requires camera integration | Phase 2+ |
| F-016 | Extended Nutritional Data | MVP focuses on core metrics (kcal/protein/carbs/fat) only | Phase 2 |
| F-017 | Food Database Expansion | Separate data initiative; current 50-item limit sufficient for MVP | Ongoing |
| F-018 | Edit Logged Foods | Can delete via meal list; in-place editing adds complexity | Phase 2 |
| F-019 | Favorites Categories | Flat list sufficient for MVP; folders add UI complexity | Phase 2 |

---

## Dependency Map

```
F-001 (Food Search)
├── F-002 (Recent Searches) ← requires search functionality
├── F-004 (Custom Foods) ← custom foods appear in search results
│   ├── F-005 (Custom Food Management) ← requires custom foods to exist
│   └── F-006 (Custom Food Limit Prompt) ← triggered by F-004 limit
└── F-011 (Smart Search Suggestions) ← enhances search [P1]

F-003 (Manual Entry)
├── F-004 (Custom Foods) ← "save for reuse" option
└── F-010 (Recent Items Enhancement) ← includes manual entries

F-007 (Favorites List)
├── F-008 (Favorites Persistence) ← storage layer
│   └── F-009 (Favorites Limit Prompt) ← triggered by F-008 limit
└── F-012 (Favorites Reordering) ← enhances favorites [P1]

Quick Add Flow (existing)
├── F-003 (Manual Entry) ← entry point from Quick Add
└── F-007 (Favorites List) ← Favorites tab on Quick Add screen
```

---

## External Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Quick Add flow (portion picker, toast with undo) | Required | Existing | Available |
| localStorage schema (`calo_logs`, `calo_recent`) | Required | Existing | Available |
| `foods.json` dataset (50 items, bilingual) | Required | Existing | Available |
| CR #1 (Account Management) | Not Required | Future | Not Started |

---

## Notes

- **Search ranking:** Exact match first → alphabetical
- **Custom foods:** Single fixed calorie value (no S/M/L portions)
- **Bilingual search:** Vietnamese and English treated equally
- **Mobile-first:** All features must work at 360px minimum width
