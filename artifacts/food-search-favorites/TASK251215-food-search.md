---
type: task-list
product: Calo Tracker
feature: F-001 Food Search, F-002 Recent Searches
version: 1
---

# Task List: Food Search

## Overview

**Goal:** Enable users to find foods from the Vietnamese database quickly by typing keywords, with instant filtering and recent search history for faster repeat searches.

**Trigger:** User taps search bar or search icon on Quick Add screen.

**End State:** User finds desired food and taps to open portion picker, OR sees empty state if no match found.

---

## Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| Linh (Young Professional) | Primary user | Searches for repeat meals, expects fast results |
| Trang (Busy Intern) | Primary user | Searches while on-the-go, low patience for slow results |
| My (Eat-Clean Student) | Primary user | Searches for specific foods, values accuracy |
| System | Automation | Filters database, ranks results, persists recent searches |

---

## User Flow

```
Open Search → Type Query → View Results → Select Food → Open Portion Picker
                ↓
         (No results) → See Empty State → Try different query OR use Manual Entry
```

---

## Steps & Tasks

### Step 1: Open Search

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 1.1 | Display search bar on Quick Add screen | Search bar visible above food tiles, placeholder text "Search foods..." |
| 1.2 | Show recent searches when search bar focused | Last 5 search terms displayed as tappable chips below search input |
| 1.3 | Allow tap on recent search to populate query | Tapping chip fills search input and triggers search |

### Step 2: Enter Search Query

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 2.1 | Capture user input as-you-type | Each keystroke updates search query state |
| 2.2 | Filter foods by Vietnamese name (`name_vi`) | Foods with matching `name_vi` appear in results |
| 2.3 | Filter foods by English name (`name_en`) | Foods with matching `name_en` appear in results |
| 2.4 | Apply search ranking: exact match first, then alphabetical | Exact matches appear at top, remaining sorted A-Z |
| 2.5 | Include custom foods in search results | User's custom foods matching query appear alongside database foods |

### Step 3: Display Search Results

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 3.1 | Show matching foods as list items | Each result shows food name (bilingual), calories, protein per portion |
| 3.2 | Indicate food source (database vs custom) | Visual badge or icon distinguishes database foods from custom foods |
| 3.3 | Show empty state when no results | Message "No foods found" with suggestion to use Manual Entry |
| 3.4 | Limit visible results for performance | Show max 20 results; user can scroll for more if needed |

### Step 4: Select Food

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 4.1 | Tap food item to select | Tapping result opens portion picker (existing S/M/L flow) |
| 4.2 | For custom foods, skip portion picker | Custom foods have fixed calories; log directly or show confirmation |
| 4.3 | Save search term to recent searches | Successful selection saves query to recent searches (max 5, FIFO) |

### Step 5: Manage Recent Searches

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 5.1 | Persist recent searches in localStorage | Recent searches survive app refresh/close |
| 5.2 | Limit to 5 recent searches | Oldest search removed when 6th is added (FIFO) |
| 5.3 | Allow clearing individual recent search | Tap X on chip removes that search term |
| 5.4 | Allow clearing all recent searches | "Clear all" option removes all recent searches |

---

## Success Criteria

| Criteria | Target | How to Measure |
|----------|--------|----------------|
| Search response time | < 100ms for 50 items | Performance testing with stopwatch |
| Search-to-selection time | < 15 seconds | Manual testing with timer |
| Result accuracy | 100% relevant matches | Test with 10 common Vietnamese food names |
| Recent searches persistence | 100% survival on refresh | Refresh app, verify searches remain |

---

## Edge Cases

| # | Edge Case | Expected Behavior | Priority |
|---|-----------|-------------------|----------|
| E1 | Empty search query | Show recent searches (if any) or popular foods placeholder | High |
| E2 | No matching results | Show empty state with "No foods found" and Manual Entry link | High |
| E3 | Query matches only custom foods | Display custom foods with source indicator | Medium |
| E4 | Special characters in query | Ignore special characters, search with alphanumeric only | Medium |
| E5 | Very long query (50+ chars) | Truncate input at 50 characters | Low |
| E6 | localStorage unavailable | Recent searches not persisted; search still functions | Low |
| E7 | Rapid typing (debounce) | Debounce search by 150ms to prevent excessive filtering | Medium |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Partial word matching ("pho" → "phở bò")? | **Yes** — substring match supported |
| Auto-show keyboard on search focus? | **Yes** — keyboard opens automatically |
