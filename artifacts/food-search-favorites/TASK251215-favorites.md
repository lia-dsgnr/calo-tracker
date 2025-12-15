---
type: task-list
product: Calo Tracker
feature: F-007 Favorites List, F-008 Favorites Persistence, F-009 Favorites Limit Prompt
version: 1
---

# Task List: Favorites

## Overview

**Goal:** Enable users to save frequently-eaten foods as favorites for one-tap logging, reducing repeat meal logging time to under 5 seconds.

**Trigger:** User taps heart icon on food tile or search result, OR accesses Favorites tab on Quick Add screen.

**End State:** Favorite foods are saved, displayed prominently, and can be logged with a single tap.

---

## Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| Linh (Young Professional) | Primary user | Saves daily coffee, lunch spots for instant logging |
| Trang (Busy Intern) | Primary user | Needs fastest possible logging for repeat meals |
| System | Automation | Stores favorites, enforces 20-item limit, persists across sessions |

---

## User Flow

```
Add Favorite:
View Food (tile/search) → Tap Heart → Added to Favorites → Heart filled

Remove Favorite:
View Favorite → Tap Filled Heart → Removed from Favorites → Heart outline

Log from Favorites:
Quick Add → Favorites Tab → Tap Favorite → Portion Picker (or direct log for custom) → Logged

Limit Reached:
Attempt to add 21st → Limit Prompt → Choose to remove existing OR Cancel
```

---

## Steps & Tasks

### Step 1: Add Food to Favorites

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 1.1 | Display heart icon on food tiles (Quick Add grid) | Outline heart visible on each food tile |
| 1.2 | Display heart icon on search results | Outline heart visible on each search result item |
| 1.3 | Tap heart to add to favorites | Heart fills, food added to favorites list |
| 1.4 | Show brief confirmation | Toast "Added to favorites" or heart animation |
| 1.5 | Support both database foods and custom foods | Either type can be favorited |

### Step 2: Remove Food from Favorites

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 2.1 | Filled heart indicates favorited status | Visual distinction between favorited and non-favorited |
| 2.2 | Tap filled heart to remove from favorites | Heart outlines, food removed from favorites |
| 2.3 | Show brief confirmation | Toast "Removed from favorites" |
| 2.4 | Can remove from Favorites tab directly | Swipe-to-remove or tap heart on Favorites tab |

### Step 3: Display Favorites Tab

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 3.1 | Add Favorites tab/section on Quick Add screen | Tab visible alongside existing sections (e.g., "All", "Recent", "Favorites") |
| 3.2 | Show favorited foods in grid or list | Display food name, calories, protein per portion |
| 3.3 | Show food source indicator | Badge distinguishes database vs custom foods |
| 3.4 | Empty state if no favorites | Message "No favorites yet. Tap ♡ to add foods." |
| 3.5 | Show count of favorites (e.g., "8/20") | User sees how many slots used |

### Step 4: Log Food from Favorites

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 4.1 | Tap favorite food to initiate logging | Single tap triggers logging flow |
| 4.2 | For database foods, open portion picker | Existing S/M/L flow for portion selection |
| 4.3 | For custom foods, log directly | No portion picker; fixed calorie value logged |
| 4.4 | Show success toast with undo | Existing toast pattern with Undo button |

### Step 5: Persist Favorites

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 5.1 | Store favorites in localStorage | Key: `calo_favorites` or similar |
| 5.2 | Load favorites on app start | Favorites available immediately on launch |
| 5.3 | Store food reference (ID) not full data | For database foods, store ID; for custom foods, store custom food ID |
| 5.4 | Handle deleted custom food in favorites | Remove from favorites if source custom food deleted |
| 5.5 | Favorites survive app refresh/reinstall | Data persists in localStorage |

### Step 6: Handle Limit (20 Favorites)

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 6.1 | Check count before adding new favorite | Count validated before add attempt |
| 6.2 | If at limit, show limit prompt dialog | Dialog: "You have 20 favorites. Remove one to add [food name]." |
| 6.3 | Limit prompt shows current favorites list | User can see which favorites to remove |
| 6.4 | Tap favorite in prompt to remove it | Removes selected favorite, adds new one |
| 6.5 | Cancel button dismisses prompt | No changes made; new food not added |
| 6.6 | Show warning when approaching limit (18+) | Non-blocking notice "2 favorite slots remaining" |

---

## Success Criteria

| Criteria | Target | How to Measure |
|----------|--------|----------------|
| Favorite-to-log time | < 5 seconds | Manual testing with timer |
| Favorites persistence | 100% survival on refresh | Refresh app, verify favorites remain |
| Add/remove responsiveness | < 100ms visual feedback | Observe heart icon animation |
| Favorites adoption | 30% users save ≥1 favorite in first week | localStorage analysis |

---

## Edge Cases

| # | Edge Case | Expected Behavior | Priority |
|---|-----------|-------------------|----------|
| E1 | Favorite food deleted from database | Remove from favorites; show toast "Some favorites no longer available" on load | Medium |
| E2 | Custom food in favorites is deleted | Remove from favorites automatically (cascade) | High |
| E3 | Favorite food's data updated in database | Favorites shows updated data (stored by reference) | Medium |
| E4 | localStorage unavailable | Favorites not persisted; feature still works in-session | Low |
| E5 | Tap heart rapidly (double-tap) | Debounce to prevent add/remove flicker | Medium |
| E6 | Exactly at 20 favorites | Must remove one before adding new | High |
| E7 | Same food in database AND as custom food | Can favorite both; they're distinct items | Low |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Manual reorder in MVP? | **No** — P1 feature, excluded from MVP |
| Show "last logged" date on favorites? | **No** — keep UI simple for MVP |
