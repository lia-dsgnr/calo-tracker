---
name: Visual Meal Timeline
overview: Revamp the Recent section into a visual timeline with horizontal tab navigation (Today/Yesterday/Tue/Mon/etc.), floating cards with emoji icons, and streamlined re-log action.
todos:
  - id: update-timeline-hook
    content: Modify useTimeline hook to support tab-based filtering by date with semantic labels
    status: completed
  - id: create-emoji-utility
    content: Create src/lib/food-emoji.ts with category-to-emoji mapping function
    status: completed
  - id: create-timeline-tabs
    content: Create TimelineTabs component with horizontal scrollable pill buttons
    status: completed
  - id: redesign-timeline-card
    content: "Simplify TimelineCard: emoji left, name/time/cal centre, re-log button right"
    status: completed
  - id: redesign-timeline-section
    content: Update TimelineSection with tabs navigation and vertical timeline with soft dots
    status: completed
  - id: cleanup-delete-action
    content: Remove onDelete prop from TimelineSection and update QuickAddPage
    status: completed
---

# Visual Meal Timeline Revamp

## Current State

The existing `TimelineSection` and `TimelineCard` components in [`src/components/QuickAdd/`](src/components/QuickAdd/) display recent meals grouped by date with expandable cards showing macros. The design is functional but lacks the visual polish shown in the mockups.

## Target Design

### Tab Navigation (horizontal, scrollable)

```
[ Today ] [ Yesterday* ] [ Tue ] [ Mon ] [ Sun ] [ Older ]
                  ↑ active (dark fill)
```

### Timeline Cards (below selected tab)

```
  ●─────[Card: 🍗 Chicken Salad | 12:45 PM • 400 cal | ↺]
  ●─────[Card: 🍚 Rice & Chicken | 8:15 AM • 550 cal | ↺]
```

## Implementation Plan

### 1. Update `useTimeline` Hook

Modify [`src/hooks/useTimeline.ts`](src/hooks/useTimeline.ts):

- Generate tabs dynamically based on available log dates (last 7 days)
- Tab structure: `{ key: string, label: string, logs: LogEntry[] }`
- Labels: "Today", "Yesterday", then weekday names (Tue, Mon, etc.), then "Older"
- Return `tabs` array and `selectedTab` state with setter
- Filter logs based on selected tab
```typescript
type TimelineTab = {
  key: string           // 'today' | 'yesterday' | 'tue' | 'older' etc.
  label: string         // Display label
  date?: string         // YYYY-MM-DD for specific days
  logs: LogEntry[]
}
```


### 2. Add Category-to-Emoji Mapping

Create [`src/lib/food-emoji.ts`](src/lib/food-emoji.ts):

```typescript
const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  noodles: '🍜',
  rice: '🍚',
  banh_mi: '🥖',
  snacks: '🍿',
  drinks: '🧃',
  desserts: '🍰',
  clean_eating: '🥗',
}
```

Using **Option B** (lookup from `foodId` at render) to avoid schema changes.

### 3. Create `TimelineTabs` Component

New file [`src/components/QuickAdd/TimelineTabs.tsx`](src/components/QuickAdd/TimelineTabs.tsx):

**Layout:**

- Horizontal scroll container (`overflow-x-auto`, hide scrollbar)
- Pill buttons with consistent spacing (`gap-2`)
- Full-width with `px-4` padding matching page

**Tab styling:**

- Inactive: `bg-gray-10 text-foreground-muted border border-gray-20`
- Active: `bg-brown-80 text-white` (dark fill as shown in mockup)
- Rounded pill shape (`rounded-pill`)
- Compact padding: `px-4 py-2`

### 4. Redesign `TimelineCard`

Simplify [`src/components/QuickAdd/TimelineCard.tsx`](src/components/QuickAdd/TimelineCard.tsx):

**Remove:**

- Expand/collapse functionality
- Macros breakdown
- Delete button

**New card anatomy:**

- Left: Emoji in subtle container (40x40, `bg-brown-10 rounded-xl`)
- Centre: Meal name (primary, `text-body font-medium`) + Time • Calories (secondary, `text-caption text-foreground-muted`)
- Right: Re-log icon button (↺) using existing `IconButton`

**Styling:**

- `bg-background-card shadow-card rounded-card`
- Horizontal padding for floating effect

### 5. Redesign `TimelineSection`

Update [`src/components/QuickAdd/TimelineSection.tsx`](src/components/QuickAdd/TimelineSection.tsx):

**New structure:**

```
┌─ Section Header: "🕐 Recent" ─────────────┐
│ [Today] [Yesterday] [Tue] [Mon] ... tabs  │
├───────────────────────────────────────────┤
│  ●── Card 1                               │
│  ●── Card 2                               │
│  ●── Card 3                               │
└───────────────────────────────────────────┘
```

**Timeline visual:**

- Container with `relative` positioning
- Vertical line: `absolute left-3 top-0 bottom-0 w-0.5 bg-gray-20`
- Dots: `w-2 h-2 rounded-full bg-gray-40` aligned with each card
- Cards: `ml-8` offset from timeline

### 6. Remove Delete Action

Only Re-log (↺) action on cards. Delete functionality remains on Dashboard's MealList.

## Files to Modify

- [`src/hooks/useTimeline.ts`](src/hooks/useTimeline.ts) - Tab-based grouping with selected state
- [`src/lib/food-emoji.ts`](src/lib/food-emoji.ts) - New: category-to-emoji utility
- [`src/components/QuickAdd/TimelineTabs.tsx`](src/components/QuickAdd/TimelineTabs.tsx) - New: horizontal tab component
- [`src/components/QuickAdd/TimelineCard.tsx`](src/components/QuickAdd/TimelineCard.tsx) - Simplified card with emoji
- [`src/components/QuickAdd/TimelineSection.tsx`](src/components/QuickAdd/TimelineSection.tsx) - Tabs + timeline layout
- [`src/components/QuickAdd/QuickAddPage.tsx`](src/components/QuickAdd/QuickAddPage.tsx) - Remove `onDelete` prop
- [`src/components/QuickAdd/index.ts`](src/components/QuickAdd/index.ts) - Export new component

## Emoji Lookup Strategy

Since `LogEntry` lacks `category`, fetch at render:

```typescript
// Cache food lookups to avoid repeated queries
const foodCategoryCache = new Map<string, FoodCategory>()
```

Acceptable for MVP (~20-30 cards max in 7 days).