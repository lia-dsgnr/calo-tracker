# Plan: Food Search Feature for Quick Add

## Overview
Add a search input to Quick Add that filters foods by Vietnamese/English name with fuzzy matching, accent-insensitive search, and recent search history.

## Key Files to Modify
- [QuickAddPage.tsx](src/components/QuickAdd/QuickAddPage.tsx) - Add search state & orchestration
- [FoodTileGrid.tsx](src/components/QuickAdd/FoodTileGrid.tsx) - Accept filtered foods prop
- [search-repository.ts](src/db/repositories/search-repository.ts) - Already has recent search CRUD
- [food-repository.ts](src/db/repositories/food-repository.ts) - May need enhanced search

## New Files
- `src/components/QuickAdd/SearchInput.tsx` - Search input component
- `src/components/QuickAdd/SearchResults.tsx` - Results list with highlighting
- `src/lib/search.ts` - Search utilities (normalize, fuzzy match)

## Database
**No schema changes needed** - `recent_search` table already exists:
```sql
CREATE TABLE IF NOT EXISTS recent_search (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  search_term TEXT NOT NULL,
  searched_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profile(id)
);
CREATE INDEX idx_recent_search_user ON recent_search(user_id, searched_at DESC);
```

Existing repository functions in `search-repository.ts`:
- `addRecentSearch()`, `getRecentSearches()`, `deleteRecentSearch()`, `clearRecentSearches()`

## Design System Consistency

New components **must use** existing design tokens from `tailwind.config.js`:

| Element | Token |
|---------|-------|
| Input background | `bg-background-card` (#FFFFFF) |
| Input border | `border-border` (#E1E1E0 / gray-20) |
| Input focus ring | `ring-ring` (#7D944D / green-60) |
| Input radius | `rounded-input` (16px) |
| Text | `text-foreground` (#372315 / brown-90) |
| Placeholder | `text-foreground-muted` (#736B66 / gray-60) |
| Result item hover | `bg-gray-10` (#F5F5F5) |
| Highlight match | `text-primary` (#7D944D / green-60) or `font-semibold` |
| Clear button | `text-foreground-muted`, hover `text-foreground` |
| "No results" text | `text-foreground-muted` |
| Loading skeleton | `bg-gray-20` with `animate-pulse` |

Typography:
- Search input: `text-body` (16px)
- Result item name: `text-body` (16px)
- Result item kcal: `text-caption text-foreground-muted` (14px)
- Section headers: `text-caption font-semibold uppercase tracking-wide`

Touch targets:
- Min 44px height (per `index.css` base styles)
- Use `tap-highlight-none` utility for cleaner mobile UX

---

## Implementation Steps

### 1. Create Search Utilities (`src/lib/search.ts`)

```typescript
// Accent normalization: phở → pho, bún → bun
function normalizeVietnamese(text: string): string

// Normalize whitespace, hyphens, apostrophes for English names
// "broken-rice" → "broken rice", "banh mi" → "banh mi"
function normalizeEnglish(text: string): string

// Sanitize input: strip special chars, limit 50 chars
function sanitizeQuery(text: string): string

// Simple Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number

// Score a food item against query (higher = better match)
function scoreMatch(food: FoodItem, query: string, useFuzzy: boolean): number
  - Exact prefix match on name_vi/name_en → highest score
  - Normalized match (accent-insensitive) → high score
  - Fuzzy match (Levenshtein ≤ 2) → medium score (only if useFuzzy=true)
  - No match → 0
```

### 2. Create SearchInput Component

```
┌─────────────────────────────────────┐
│ 🔍 Search food...              [×]  │
└─────────────────────────────────────┘
```

Props:
- `value: string`
- `onChange: (value: string) => void`
- `onFocus: () => void`
- `onClear: () => void`

Features:
- Debounced onChange (200ms)
- Clear button when text present
- Rounded corners, subtle border
- Auto-focus disabled by default (tap to focus)
- **50 char max**, special chars stripped on input
- **Enter key** saves to recent searches (not on every keystroke)
- Show "Searching..." during debounce/loading

### 3. Create SearchResults Component

When query is empty (input focused):
```
Recent Searches
├── "phở" [×]
├── "cơm tấm" [×]
└── "bún chả" [×]
[Clear all]
```

When query has results:
```
├── **Phở** bò tái · 420 kcal
├── **Phở** gà · 360 kcal
└── Bún **phở** · 380 kcal  (highlighted match)
```

When no results:
```
No foods found for "xyz"

Recent Searches
├── "phở" [×]
├── "cơm tấm" [×]
└── "bún chả" [×]
[Clear input]
```

### 4. Update QuickAddPage

State additions:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [isSearchFocused, setIsSearchFocused] = useState(false)
const [searchResults, setSearchResults] = useState<FoodItem[]>([])
```

Flow:
1. Empty search, not focused → show FoodTileGrid (existing)
2. Empty search, focused → show recent searches
3. Has query → show filtered SearchResults
4. Select result → open PortionPicker (reuse existing flow)

### Undo Consistency

Search results selection **reuses the existing undo flow** in QuickAddPage:
- `handleSelectFood(food)` → opens PortionPicker (same as tile tap)
- `handleSelectPortion(portion)` → calls `addFood()`, stores `lastEntryRef`
- Toast shows "Added {name_vi} (portion)" with Undo button
- `handleUndo()` → calls `removeLog(entry.id)`
- No changes needed to Toast or undo logic - search just feeds into existing flow

### 5. Search Algorithm

```typescript
function searchFoods(foods: FoodItem[], query: string): FoodItem[] {
  // Require minimum 2 characters to search
  if (query.trim().length < 2) return []

  const normalized = normalizeVietnamese(query.toLowerCase().trim())
  const useFuzzy = query.trim().length >= 4  // Fuzzy only for 4+ chars

  return foods
    .map(food => ({ food, score: scoreMatch(food, normalized, useFuzzy) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ food }) => food)  // No limit - show all matches
}
```

Matching priority:
1. Exact prefix (name_vi starts with query) → 100 pts
2. Exact prefix (name_en starts with query) → 90 pts
3. Contains (normalized) → 50 pts
4. Fuzzy (Levenshtein ≤ 2) → 20 pts **(only if query ≥ 4 chars)**

### 6. Accent Normalization Map

```typescript
const VIETNAMESE_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
}
```

### 7. Recent Searches Integration

Use existing repository functions:
- `getRecentSearches(userId)` - Load on component mount
- `addRecentSearch(userId, term)` - Save on **Enter key press** (not on every keystroke)
- `deleteRecentSearch(id)` - Remove individual search
- `clearRecentSearches(userId)` - Clear all button

---

## UI Layout (QuickAddPage)

```
┌─────────────────────────────────────┐
│ Quick Add                           │
│ ████████░░░░░░░ 1200 / 2000 kcal   │  ← Sticky header (existing)
├─────────────────────────────────────┤
│ 🔍 Search food...              [×]  │  ← NEW: Search input
├─────────────────────────────────────┤
│                                     │
│ [Search Results / Recent / Grid]    │  ← Conditional content
│                                     │
└─────────────────────────────────────┘
```

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| `pho` vs `phở` | Both match via normalization |
| `bun cha` vs `bún chả` | Both match |
| `broken rice` | Matches "Broken rice w/ pork chop" (name_en) |
| `com tam` | Matches "Cơm tấm" via normalization |
| Typo: `pno` | Fuzzy matches "pho" (Levenshtein=1) |
| Empty after backspace | Show recent searches |
| Very fast typing | 200ms debounce prevents lag |
| Long query, no match | Show "No results" + recent searches + clear button |
| 1 char typed | No search yet (min 2 chars) - show recent searches |
| 2 chars "ph" | Shows results (exact/contains only, no fuzzy) |
| 4+ chars "phon" | Enables fuzzy matching for typos |
| Special chars "phở@#" | Stripped to "phở" |
| 51+ chars | Truncated to 50 chars |

---

## Testing

### During Implementation
After each component, verify manually in the browser:

1. **After SearchInput.tsx**
   - Input renders below header
   - Typing shows text, clear (×) button appears
   - Clear button resets input
   - Focus/blur events fire correctly

2. **After search.ts utilities**
   - Run in browser console or add temp test:
   ```typescript
   normalizeVietnamese('Phở bò') // → 'pho bo'
   levenshteinDistance('pho', 'pno') // → 1
   searchFoods(allFoods, 'pho') // → returns phở items
   searchFoods(allFoods, 'com tam') // → returns cơm tấm items
   ```

3. **After SearchResults.tsx**
   - Results display with highlighted matches
   - Tapping result triggers food selection
   - Recent searches show when empty
   - "No results" state displays correctly

4. **After QuickAddPage integration**
   - Full flow: type → results → select → portion picker → toast

### Post-Implementation Checklist

| Test Case | Expected |
|-----------|----------|
| Type "pho" | Shows Phở bò tái, Phở gà |
| Type "phở" | Same results as "pho" |
| Type "com tam" | Shows Cơm tấm variations |
| Type "broken" | Shows "Broken rice w/ pork chop" |
| Type "pno" (typo) | Fuzzy matches "pho" items |
| Type "xyz" | "No results" + recent searches |
| Type 1 char "p" | No results yet (min 2) |
| Type 2 chars "ph" | Shows results (no fuzzy yet) |
| Type 4+ chars with typo | Fuzzy kicks in |
| Press Enter | Saves to recent searches |
| Paste 60 chars | Truncated to 50 |
| Type "@#$" | Special chars stripped |
| Empty + focused | Recent searches list |
| Select result | Opens PortionPicker |
| Add from search + Undo | Removes entry (same as tile flow) |
| Clear button | Resets to empty, shows recent |
| Scroll results | Keyboard hides |
| Delete recent search | Removes from list |
| Fast typing | No lag (debounce works) |

---

## Decisions

| Question | Decision |
|----------|----------|
| Minimum query length | **2 chars** to start searching |
| Result limit | **Unlimited scroll** through all matches |
| Highlight matches | **Yes** - bold matched portion |
| Empty state (no results) | Show recent searches + clear button |
| Empty state (focused, no query) | Show recent searches only (not recent items) |
| Category badges | **No** - keep minimal (name + kcal) |
| Custom foods in results | **Skip for now** - implement later |
| Category filtering | **Skip for now** |
| Keyboard behavior | Auto-focus on tap, clear (×) button, hide on scroll |
| Save recent search | On **Enter key** or submit, not on every keystroke |
| Fuzzy matching | Only when query **≥ 4 chars** |
| Input validation | **50 char limit**, no special characters |
| Loading state | Show "Searching..." or skeleton |
| Result item display | Primary name (name_vi) + kcal (minimum) |
