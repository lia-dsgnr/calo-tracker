---
type: task-list
product: Calo Tracker
feature: F-004 Custom Foods, F-005 Custom Food Management, F-006 Custom Food Limit Prompt
version: 1
---

# Task List: Custom Foods

## Overview

**Goal:** Enable users to save manually-entered foods for reuse, manage their custom food library (edit/delete), and handle the 30-item limit gracefully.

**Trigger:** User checks "Save as custom food" during manual entry, OR accesses custom foods from settings/profile.

**End State:** Custom food is saved, appears in search results, and can be edited or deleted as needed.

---

## Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| Linh (Young Professional) | Primary user | Saves restaurant meals eaten weekly for quick relogging |
| My (Eat-Clean Student) | Primary user | Creates custom foods for homemade meals with precise macros |
| System | Automation | Stores custom foods, enforces 30-item limit, merges into search |

---

## User Flow

```
Create Custom Food:
Manual Entry → Check "Save as custom" → Save → Custom food stored → Appears in search

Manage Custom Foods:
Settings → Custom Foods List → Edit OR Delete → Confirm → Updated/Removed

Limit Reached:
Attempt to save 31st → Limit Prompt → Manage existing OR Cancel
```

---

## Steps & Tasks

### Step 1: Create Custom Food

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 1.1 | Save custom food from manual entry form | When checkbox checked, food saved to `custom_foods` storage |
| 1.2 | Store food name, calories (required), protein/carbs/fat (optional) | All fields persisted; optional fields can be null |
| 1.3 | Assign unique ID to custom food | UUID or timestamp-based ID for edit/delete reference |
| 1.4 | Custom food has single fixed calorie value | No S/M/L portions; one calorie value only |
| 1.5 | Show confirmation toast | "Saved [food name] to custom foods" |

### Step 2: Display Custom Foods in Search

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 2.1 | Include custom foods in search results | Custom foods matching query appear alongside database foods |
| 2.2 | Indicate custom food source visually | Badge or icon distinguishes custom foods from database |
| 2.3 | Apply same search ranking to custom foods | Exact match first, then alphabetical |
| 2.4 | Tap custom food to log directly | No portion picker; logs fixed calorie value immediately |

### Step 3: Access Custom Foods Management

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 3.1 | Add "Custom Foods" option in settings/profile | Menu item visible in app settings |
| 3.2 | Display list of all custom foods | Shows name, calories, macros for each custom food |
| 3.3 | Show count of custom foods (e.g., "12/30") | User sees how many slots used |
| 3.4 | Empty state if no custom foods | Message "No custom foods yet" with explanation |

### Step 4: Edit Custom Food

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 4.1 | Tap custom food to open edit form | Form pre-filled with existing values |
| 4.2 | Allow editing name, calories, protein, carbs, fat | All fields editable |
| 4.3 | Validate edited values (same rules as creation) | Error if calories ≤ 0 or name empty |
| 4.4 | Save changes and confirm | Toast "Updated [food name]" |
| 4.5 | Cancel edit without saving | Discard changes, return to list |

### Step 5: Delete Custom Food

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 5.1 | Show delete option on custom food item | Swipe-to-delete or delete icon |
| 5.2 | Confirm deletion before removing | Dialog "Delete [food name]?" with Cancel/Delete buttons |
| 5.3 | Remove custom food from storage | Food no longer appears in search or list |
| 5.4 | Show confirmation toast | "Deleted [food name]" |
| 5.5 | If custom food was in Favorites, remove from Favorites too | Cascade delete to maintain data integrity |

### Step 6: Handle Limit (30 Custom Foods)

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 6.1 | Check count before saving new custom food | Count validated before save attempt |
| 6.2 | If at limit, show limit prompt dialog | Dialog: "You've reached 30 custom foods. Manage your list to add more." |
| 6.3 | Limit prompt offers "Manage" button | Button navigates to Custom Foods Management screen |
| 6.4 | Limit prompt offers "Cancel" button | Dismisses dialog; food logged but not saved as custom |
| 6.5 | Show warning when approaching limit (25+) | Non-blocking notice "5 custom food slots remaining" |

---

## Success Criteria

| Criteria | Target | How to Measure |
|----------|--------|----------------|
| Custom food save success | 100% valid entries saved | Test creating 10 custom foods |
| Custom foods in search | 100% appear in relevant searches | Search for custom food names |
| Edit/delete functionality | 100% operations succeed | Test edit and delete flows |
| Limit enforcement | 100% blocks 31st entry | Attempt to exceed limit |

---

## Edge Cases

| # | Edge Case | Expected Behavior | Priority |
|---|-----------|-------------------|----------|
| E1 | Duplicate custom food name | Allow; user may have "Lunch salad (Mon)" and "Lunch salad (Fri)" | Medium |
| E2 | Edit to duplicate name | Allow; same rationale as E1 | Low |
| E3 | Delete custom food that's in recent logs | Logs retain original values; custom food removed from future search | High |
| E4 | Custom food in Favorites when deleted | Remove from Favorites; show toast noting removal | High |
| E5 | localStorage full | Show error "Storage full. Delete some data to continue." | Medium |
| E6 | Exactly at 30 limit | "Manage" or delete one before adding new | High |
| E7 | Bulk delete custom foods | Not supported in MVP; delete one at a time | Low |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Allow importing custom foods from file? | **No** — out of scope for MVP |
| Undo for custom food deletion? | **Yes** — 5-second undo toast |
