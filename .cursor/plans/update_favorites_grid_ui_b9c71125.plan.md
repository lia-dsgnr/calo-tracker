---
name: Update Favorites Grid UI
overview: Update the FavoritesGrid component to display favorites in a grid layout with usage counts, category icons, and an edit mode that allows individual removal or removing all favorites at once.
todos: []
---

# Update Favorites Grid UI

## Overview

Transform the favorites section from a vertical list to a grid layout showing food name, calories, category icon, and usage count. Add edit mode with individual remove buttons on each card and a "Remove All" button alongside a "Save" button.

## Current State

- `FavoritesGrid.tsx` displays favorites as a vertical list using `FavoriteTile` components
- `FavoriteTile.tsx` shows food name with heart icon (remove) and plus icon (quick log)
- Favorites data includes `useCount` from the database (already tracked via `recordFavoriteUse`)
- Category emojis are defined in `FoodTileGrid.tsx` as `CATEGORY_ORDER`

## Changes Required

### 1. Update FavoritesGrid Component

**File:** `src/components/QuickAdd/FavoritesGrid.tsx`

- **Grid Layout**: Change from vertical list (`flex flex-col gap-2`) to responsive grid:
  - 2 columns on mobile screens
  - 3 columns on larger screens (tablet+)
  - Use `grid grid-cols-2 md:grid-cols-3 gap-3` or similar

- **Edit Mode State**: Add `isEditMode` state to toggle edit functionality

- **Header Section**: Update header to include:
  - Title "Favorites" with heart emoji (existing)
  - "Edit" button when not in edit mode
  - "Save" and "Remove All" buttons when in edit mode (positioned next to each other)

- **Remove All Functionality**: 
  - Create `handleRemoveAll` function that:
    - Iterates through all valid favorites
    - Calls `removeFavorite` for each
    - Shows confirmation dialog before removing (per user preference)
    - Refreshes the list after completion

- **Pass Edit Mode to Cards**: Pass `isEditMode` prop to favorite cards so they can show/hide remove buttons

### 2. Create New FavoriteCard Component

**File:** `src/components/QuickAdd/FavoriteCard.tsx` (new file)

Create a new card component optimized for grid display:

- **Layout**: Card-based design showing:
  - Category emoji/icon at top (centered or top-left)
  - Food name (Vietnamese name)
  - Calories (M portion as default)
  - Usage count badge (e.g., "3x", "10x") in top-right corner
  - Remove IconButton (only visible in edit mode)

- **Props**:
  ```typescript
  interface FavoriteCardProps {
    food: FoodItem
    useCount: number
    defaultPortion: PortionSize
    isEditMode: boolean
    onSelect: (food: FoodItem) => void
    onQuickLog: (food: FoodItem, portion: PortionSize) => void
    onRemove?: (food: FoodItem) => void
  }
  ```

- **Styling**:
  - Card with rounded corners, shadow
  - Usage count badge: small, green background, positioned top-right
  - Category emoji: larger size, prominent display
  - Food name: medium weight, truncate if too long
  - Calories: smaller text, muted color
  - Remove button: only visible when `isEditMode === true`

- **Interactions**:
  - Card click: opens portion picker (when not in edit mode)
  - Remove button: calls `onRemove` callback
  - In edit mode: clicking card removes it (per user preference)

### 3. Update FavoriteTile Component (Optional)

**File:** `src/components/QuickAdd/FavoriteTile.tsx`

- Keep `FavoriteTile` for backward compatibility if used elsewhere, or deprecate in favor of `FavoriteCard`
- If `FavoriteTile` is only used in `FavoritesGrid`, we can replace it entirely

### 4. Category Icon Mapping

**File:** `src/components/QuickAdd/FavoritesGrid.tsx` or shared utility

- Extract or reuse `CATEGORY_ORDER` from `FoodTileGrid.tsx` to map category IDs to emojis
- Create helper function: `getCategoryEmoji(category: FoodCategory): string`

### 5. Confirmation Dialog for Remove All

**File:** `src/components/QuickAdd/FavoritesGrid.tsx`

- Add confirmation dialog before removing all favorites
- Use a simple browser `confirm()` or create a custom dialog component
- Message: "Remove all favorites? This action cannot be undone."

## Implementation Details

### Grid Layout Responsive Breakpoints

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {validFavorites.map(...)}
</div>
```

### Edit Mode Toggle

```tsx
const [isEditMode, setIsEditMode] = useState(false)

// Header buttons
{!isEditMode ? (
  <button onClick={() => setIsEditMode(true)}>Edit</button>
) : (
  <>
    <button onClick={handleRemoveAll}>Remove All</button>
    <button onClick={() => setIsEditMode(false)}>Save</button>
  </>
)}
```

### Usage Count Display

- Format: `{useCount}x` (e.g., "3x", "15x")
- Badge styling: small, rounded, green background, positioned absolutely in top-right corner

### Remove All Implementation

```tsx
const handleRemoveAll = useCallback(async () => {
  if (!currentUser) return
  
  const confirmed = window.confirm('Remove all favorites? This action cannot be undone.')
  if (!confirmed) return
  
  // Remove all favorites
  await Promise.all(
    validFavorites.map(({ favorite }) => 
      removeFavorite(currentUser.id, favorite.foodType, favorite.foodId)
    )
  )
  
  trackEvent('quickadd_favorites_removed_all', { count: validFavorites.length })
  refresh()
  setIsEditMode(false)
}, [currentUser, validFavorites, refresh])
```

## Files to Modify

1. `src/components/QuickAdd/FavoritesGrid.tsx` - Main grid component with edit mode
2. `src/components/QuickAdd/FavoriteCard.tsx` - New grid card component (create)
3. `src/components/QuickAdd/FavoriteTile.tsx` - May be deprecated or kept for compatibility

## Testing Considerations

- Verify grid layout on mobile (2 columns) and tablet/desktop (3 columns)
- Test edit mode toggle and button visibility
- Verify usage counts display correctly from `favorite.useCount`
- Test individual remove in edit mode
- Test "Remove All" with confirmation
- Verify category emojis display correctly
- Ensure cards remain clickable when not in edit mode
- In edit mode, clicking card should remove it (per user preference)