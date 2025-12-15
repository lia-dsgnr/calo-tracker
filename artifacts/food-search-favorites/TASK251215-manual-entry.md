---
type: task-list
product: Calo Tracker
feature: F-003 Manual Entry
version: 1
---

# Task List: Manual Entry

## Overview

**Goal:** Enable users to log foods not found in the database by entering name and nutritional values manually, providing a fallback when search yields no results.

**Trigger:** User taps "Can't find your food?" link below search results (empty state or after unsuccessful search).

**End State:** Food is logged to today's meals with user-provided values and timestamp.

---

## Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| My (Eat-Clean Student) | Primary user | Logs diverse/unusual foods not in database |
| Linh (Young Professional) | Secondary user | Occasionally logs restaurant-specific items |
| System | Automation | Validates input, saves to log, shows confirmation |

---

## User Flow

```
Tap "Can't find?" → Open Entry Form → Fill Required Fields → (Optional: Fill Macros) → Save → Confirm & Close
                                                                    ↓
                                                         (Optional) Save as Custom Food
```

---

## Steps & Tasks

### Step 1: Access Manual Entry

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 1.1 | Show "Can't find your food?" link below search results | Link visible when results shown or empty state displayed |
| 1.2 | Tap link to open manual entry form | Modal or new screen opens with entry form |

### Step 2: Enter Food Details

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 2.1 | Display food name input field | Text input with placeholder "Food name", max 50 characters |
| 2.2 | Display calories input field (required) | Numeric input with placeholder "Calories (kcal)", required validation |
| 2.3 | Display protein input field (optional) | Numeric input with placeholder "Protein (g)", optional |
| 2.4 | Display carbs input field (optional) | Numeric input with placeholder "Carbs (g)", optional |
| 2.5 | Display fat input field (optional) | Numeric input with placeholder "Fat (g)", optional |
| 2.6 | Show "Save as custom food" checkbox | Checkbox to save for future reuse, unchecked by default |

### Step 3: Validate Input

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 3.1 | Validate food name is not empty | Error message if name blank on submit |
| 3.2 | Validate calories is a positive number | Error message if calories ≤ 0 or non-numeric |
| 3.3 | Validate optional macros are non-negative | Error message if protein/carbs/fat < 0 |
| 3.4 | Show inline validation errors | Errors appear below respective fields, not as alert |

### Step 4: Save to Log

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 4.1 | Save food to today's meal log | Entry added to `calo_logs` with timestamp, source: "manual" |
| 4.2 | Show success toast with undo option | Toast "Added [food name]" with Undo button (existing pattern) |
| 4.3 | Close form and return to previous screen | Form dismissed, user back on Quick Add or search |

### Step 5: Save as Custom Food (Optional)

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 5.1 | If checkbox checked, save to custom foods | Entry added to custom foods storage (separate from F-004 task list) |
| 5.2 | Check custom foods limit before saving | If at 30 limit, show error and prompt to manage (F-006) |
| 5.3 | Confirm custom food saved | Toast includes "Saved to custom foods" message |

---

## Success Criteria

| Criteria | Target | How to Measure |
|----------|--------|----------------|
| Form completion time | < 30 seconds | Manual testing with timer |
| Validation error clarity | 100% users understand error | Usability testing |
| Save success rate | 100% valid entries saved | Test with 10 different entries |
| Manual entry adoption | 10% of logs use manual entry | Log source tracking |

---

## Edge Cases

| # | Edge Case | Expected Behavior | Priority |
|---|-----------|-------------------|----------|
| E1 | Extremely high calories (>5000) | Show warning "Are you sure? This seems high" but allow save | Medium |
| E2 | Duplicate food name (same as existing custom food) | Allow save; duplicates permitted in log | Low |
| E3 | Form abandoned mid-entry | No save; data lost (acceptable for MVP) | Low |
| E4 | Network error during save | N/A — localStorage only, always succeeds | N/A |
| E5 | Special characters in food name | Allow; no character restrictions except length | Low |
| E6 | Decimal values for macros | Allow decimals (e.g., 2.5g protein) | Medium |
| E7 | Save as custom when at 30 limit | Show F-006 limit prompt; do not save as custom but still log meal | High |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Pre-fill food name from failed search? | **Yes** — improves UX |
| Auto-calculate macros from calories? | **No** — leave blank if not entered |
