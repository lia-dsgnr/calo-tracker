---
type: task-list
product: Calo Tracker
feature: F-010 Recent Items Enhancement
version: 1
---

# Task List: Recent Items Enhancement

## Overview

**Goal:** Extend the existing "Recent" section to include manually-entered foods and display a source indicator, enabling quick re-logging of any recent meal regardless of how it was originally logged.

**Trigger:** User logs any food (database, custom, or manual entry); user views Recent section on Quick Add screen.

**End State:** Recent section shows all recently logged foods with clear source indicators, allowing one-tap re-logging.

---

## Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| Linh (Young Professional) | Primary user | Re-logs yesterday's meals quickly |
| Trang (Busy Intern) | Primary user | Needs to see and repeat recent meals fast |
| System | Automation | Tracks recent logs, displays source, enables re-logging |

---

## User Flow

```
Log Food (any source) → Added to Recent → Recent Section Updated

Re-log from Recent:
Quick Add → Recent Tab → Tap Recent Item → Portion Picker (or direct log) → Logged
```

---

## Steps & Tasks

### Step 1: Track Recent Items

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 1.1 | Add logged food to recent items list | Every logged food (database, custom, manual) added to `calo_recent` |
| 1.2 | Store food data with source indicator | Source field: "database", "custom", or "manual" |
| 1.3 | For database/custom foods, store reference ID | Enables fetching current data |
| 1.4 | For manual entries, store snapshot of values | Name, calories, macros captured at log time |
| 1.5 | Maintain recent list order (most recent first) | Newest items at top |
| 1.6 | Limit recent items (e.g., 20 items) | Oldest removed when limit exceeded (FIFO) |

### Step 2: Display Recent Items

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 2.1 | Show Recent tab/section on Quick Add screen | Tab visible alongside "All", "Favorites" |
| 2.2 | Display recent foods with name, calories, protein | Consistent with other food displays |
| 2.3 | Show source indicator on each item | Visual badge: database icon, custom icon, or "Manual" label |
| 2.4 | Empty state if no recent items | Message "No recent foods. Start logging to see them here." |

### Step 3: Re-log from Recent

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 3.1 | Tap recent database food to open portion picker | Existing S/M/L flow |
| 3.2 | Tap recent custom food to log directly | Fixed calorie value, no portion picker |
| 3.3 | Tap recent manual entry to log with same values | Uses stored snapshot values |
| 3.4 | Show success toast with undo | Existing toast pattern |
| 3.5 | Re-logged item moves to top of recent list | Most recent always first |

### Step 4: Handle Data Changes

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| 4.1 | Database food updated: show current values | Recent item reflects current database data |
| 4.2 | Custom food edited: show current values | Recent item reflects edited custom food data |
| 4.3 | Custom food deleted: keep in recent with snapshot | Recent shows "[Deleted]" badge, logs with original values |
| 4.4 | Manual entry has no source to update | Always uses stored snapshot |

---

## Success Criteria

| Criteria | Target | How to Measure |
|----------|--------|----------------|
| Recent list accuracy | 100% logged foods appear | Log 10 foods, verify all in Recent |
| Source indicator clarity | 100% users identify source | Usability testing |
| Re-log time | < 5 seconds | Manual testing with timer |
| Data persistence | 100% survival on refresh | Refresh app, verify recent items remain |

---

## Edge Cases

| # | Edge Case | Expected Behavior | Priority |
|---|-----------|-------------------|----------|
| E1 | Same food logged multiple times | Each log creates separate recent entry (shows timestamp) | Medium |
| E2 | Custom food deleted after appearing in recent | Show "[Deleted]" badge; re-log uses snapshot values | High |
| E3 | Manual entry with same name as database food | Both appear in recent; source indicator distinguishes | Medium |
| E4 | Recent list exceeds limit | Oldest items removed automatically (FIFO) | Medium |
| E5 | Database food removed from `foods.json` | Show "[Unavailable]" badge; re-log uses snapshot | Low |
| E6 | localStorage migration from old schema | Migrate existing `calo_recent` to include source field | High |

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Show timestamp on recent items? | **Yes** — relative time ("2 hours ago") |
| Collapse duplicate consecutive entries? | **No** — keep separate for accurate history |
| Recent items limit? | **20 items** — aligned with favorites limit |
