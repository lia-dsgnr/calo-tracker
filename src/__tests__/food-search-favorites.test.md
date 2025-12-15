# Food Search, Manual Entry & Favorites - Test Plan

This document outlines the test cases for the Food Search, Manual Entry, Custom Foods, Favorites, and Recent Items Enhancement features.

## Test Framework Setup Required

To run these tests, install Vitest:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
})
```

---

## Unit Tests

### Search Ranking Algorithm

```typescript
// src/hooks/__tests__/useSearch.test.ts

describe('rankSearchResults', () => {
  it('should rank exact matches first', () => {
    const results = [
      { name: 'Phở bò', ... },
      { name: 'Phở', ... },
      { name: 'Phở gà', ... },
    ]
    const ranked = rankSearchResults(results, 'phở')
    expect(ranked[0].name).toBe('Phở')
  })

  it('should rank prefix matches before substring matches', () => {
    const results = [
      { name: 'Cơm gà', ... },
      { name: 'Cơm', ... },
    ]
    const ranked = rankSearchResults(results, 'cơm')
    expect(ranked[0].name).toBe('Cơm')
  })

  it('should handle bilingual search (Vietnamese and English)', () => {
    const results = searchFoods('rice')
    expect(results.some(r => r.nameEn?.includes('rice'))).toBe(true)
  })

  it('should be case insensitive', () => {
    const results1 = searchFoods('PHO')
    const results2 = searchFoods('pho')
    expect(results1).toEqual(results2)
  })
})
```

### Form Validation

```typescript
// src/components/QuickAdd/__tests__/ManualEntryModal.test.ts

describe('ManualEntryModal validation', () => {
  it('should require name field', () => {
    const errors = validateForm({ name: '', kcal: '100', ... })
    expect(errors.name).toBe('Name is required')
  })

  it('should require positive calories', () => {
    const errors = validateForm({ name: 'Test', kcal: '0', ... })
    expect(errors.kcal).toBe('Calories must be a positive number')
  })

  it('should allow decimal macros', () => {
    const errors = validateForm({ protein: '2.5', ... })
    expect(errors.protein).toBeUndefined()
  })

  it('should reject negative macros', () => {
    const errors = validateForm({ protein: '-1', ... })
    expect(errors.protein).toBe('Protein must be non-negative')
  })

  it('should show warning for high calories (>5000)', () => {
    // Warning shown but save still allowed
    const form = { kcal: '5500', ... }
    expect(showHighCalorieWarning(form)).toBe(true)
  })

  it('should enforce max name length (50 chars)', () => {
    const longName = 'a'.repeat(51)
    const errors = validateForm({ name: longName, ... })
    expect(errors.name).toContain('50 characters')
  })
})
```

### Custom Foods Repository

```typescript
// src/db/repositories/__tests__/food-repository.test.ts

describe('Custom Foods', () => {
  it('should create custom food with all fields', async () => {
    const food = await createCustomFood(userId, {
      name: 'Test Food',
      kcal: 200,
      protein: 10,
      carbs: 20,
      fat: 5,
    })
    expect(food).not.toBeNull()
    expect(food?.name).toBe('Test Food')
  })

  it('should enforce 30-item limit per user', async () => {
    // Create 30 foods
    for (let i = 0; i < 30; i++) {
      await createCustomFood(userId, { name: `Food ${i}`, kcal: 100 })
    }
    // 31st should return null
    const result = await createCustomFood(userId, { name: 'Food 31', kcal: 100 })
    expect(result).toBeNull()
  })

  it('should soft delete custom food', async () => {
    const food = await createCustomFood(userId, { name: 'ToDelete', kcal: 100 })
    await deleteCustomFood(food!.id)
    const deleted = await getCustomFoodById(food!.id)
    expect(deleted).toBeNull()
  })

  it('should search custom foods by name', async () => {
    await createCustomFood(userId, { name: 'My Salad', kcal: 150 })
    const results = await searchCustomFoods(userId, 'salad')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('My Salad')
  })
})
```

### Favorites Repository

```typescript
// src/db/repositories/__tests__/favorite-repository.test.ts

describe('Favorites', () => {
  it('should add food to favorites', async () => {
    const fav = await addFavorite(userId, 'system', foodId)
    expect(fav).not.toBeNull()
  })

  it('should enforce 20-item limit', async () => {
    // Add 20 favorites
    for (let i = 0; i < 20; i++) {
      await addFavorite(userId, 'system', `food-${i}`)
    }
    // 21st should return null
    const result = await addFavorite(userId, 'system', 'food-20')
    expect(result).toBeNull()
  })

  it('should toggle favorite on/off', async () => {
    // Add
    const added = await toggleFavorite(userId, 'system', foodId)
    expect(added).not.toBeNull()
    
    // Remove
    const removed = await toggleFavorite(userId, 'system', foodId)
    expect(removed).toBeNull()
  })

  it('should check isFavorited correctly', async () => {
    await addFavorite(userId, 'system', foodId)
    expect(await isFavorited(userId, 'system', foodId)).toBe(true)
    expect(await isFavorited(userId, 'system', 'other-id')).toBe(false)
  })

  it('should debounce rapid taps', async () => {
    // Simulate rapid taps (handled in UI component)
    // Verify only one toggle occurs
  })
})
```

---

## Integration Tests

### Search to Log Flow

```typescript
describe('Search to Log integration', () => {
  it('should complete full flow: search → select → portion → toast', async () => {
    // 1. Type search query
    await userEvent.type(screen.getByPlaceholder('Search foods...'), 'phở')
    
    // 2. Wait for results
    await waitFor(() => {
      expect(screen.getByText(/phở bò/i)).toBeInTheDocument()
    })
    
    // 3. Select food
    await userEvent.click(screen.getByText(/phở bò/i))
    
    // 4. Select portion
    await userEvent.click(screen.getByText('M'))
    
    // 5. Verify toast
    expect(screen.getByText(/added phở bò/i)).toBeInTheDocument()
  })

  it('should save search term to recent searches on selection', async () => {
    await userEvent.type(screen.getByPlaceholder('Search foods...'), 'cơm')
    await userEvent.click(screen.getByText(/cơm gà/i))
    
    // Clear and focus search
    await userEvent.clear(screen.getByPlaceholder('Search foods...'))
    
    // Recent searches should show 'cơm'
    expect(screen.getByText('cơm')).toBeInTheDocument()
  })
})
```

### Manual Entry Flow

```typescript
describe('Manual Entry integration', () => {
  it('should complete flow: empty search → manual entry → log', async () => {
    // 1. Search for non-existent food
    await userEvent.type(screen.getByPlaceholder('Search foods...'), 'xyz123')
    
    // 2. Click "Can't find your food?"
    await userEvent.click(screen.getByText(/can't find/i))
    
    // 3. Fill form
    await userEvent.type(screen.getByLabelText(/food name/i), 'My Custom Meal')
    await userEvent.type(screen.getByLabelText(/calories/i), '500')
    
    // 4. Save
    await userEvent.click(screen.getByText('Add Food'))
    
    // 5. Verify toast
    expect(screen.getByText(/added my custom meal/i)).toBeInTheDocument()
  })

  it('should pre-fill name from search query', async () => {
    await userEvent.type(screen.getByPlaceholder('Search foods...'), 'special food')
    await userEvent.click(screen.getByText(/can't find/i))
    
    expect(screen.getByLabelText(/food name/i)).toHaveValue('special food')
  })
})
```

### Custom Food to Search Results

```typescript
describe('Custom Food in Search', () => {
  it('should show custom food in search results after creation', async () => {
    // Create custom food via manual entry
    await openManualEntry()
    await fillForm({ name: 'My Protein Shake', kcal: '250' })
    await checkSaveAsCustom()
    await saveForm()
    
    // Search for it
    await userEvent.type(screen.getByPlaceholder('Search foods...'), 'protein shake')
    
    await waitFor(() => {
      expect(screen.getByText('My Protein Shake')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument() // Badge
    })
  })
})
```

### Favorites Flow

```typescript
describe('Favorites integration', () => {
  it('should toggle favorite via heart icon', async () => {
    const heartButton = screen.getByLabelText(/add.*favorites/i)
    
    // Add
    await userEvent.click(heartButton)
    expect(screen.getByText(/added to favorites/i)).toBeInTheDocument()
    
    // Remove
    await userEvent.click(heartButton)
    expect(screen.getByText(/removed from favorites/i)).toBeInTheDocument()
  })

  it('should show favorites in Favorites tab', async () => {
    // Add favorite
    await userEvent.click(screen.getByLabelText(/add.*phở.*favorites/i))
    
    // Switch to Favorites tab
    await userEvent.click(screen.getByText('Favorites'))
    
    // Verify food is shown
    expect(screen.getByText(/phở/i)).toBeInTheDocument()
  })

  it('should log from Favorites with one tap', async () => {
    // Setup: add favorite
    // Switch to Favorites tab
    // Tap favorite food
    // Verify portion picker opens (for system food) or logs directly (custom)
  })
})
```

---

## Edge Case Tests

### E1: Empty search shows recent searches

```typescript
it('should show recent searches when search is empty', async () => {
  // Perform a search and select
  await searchAndSelect('phở')
  
  // Clear search
  await userEvent.clear(screen.getByPlaceholder('Search foods...'))
  
  // Verify recent searches are shown
  expect(screen.getByText('phở')).toBeInTheDocument()
  expect(screen.getByText('Recent searches')).toBeInTheDocument()
})
```

### E4: Special characters in query

```typescript
it('should handle special characters in search', async () => {
  await userEvent.type(screen.getByPlaceholder('Search foods...'), '<script>')
  // Should not break, search still works
  expect(screen.queryByText('No foods found')).toBeInTheDocument()
})
```

### E5: Query length truncation

```typescript
it('should truncate query at 50 characters', async () => {
  const longQuery = 'a'.repeat(60)
  await userEvent.type(screen.getByPlaceholder('Search foods...'), longQuery)
  expect(screen.getByPlaceholder('Search foods...')).toHaveValue('a'.repeat(50))
})
```

### Custom Food Limit (30)

```typescript
it('should show limit prompt at 30 custom foods', async () => {
  // Setup: create 30 custom foods
  // Try to save 31st via manual entry with "save as custom" checked
  expect(screen.getByText(/reached 30 custom foods/i)).toBeInTheDocument()
})
```

### Favorites Limit (20)

```typescript
it('should show limit prompt at 20 favorites', async () => {
  // Setup: add 20 favorites
  // Try to add 21st
  expect(screen.getByText(/20 favorites/i)).toBeInTheDocument()
  expect(screen.getByText(/remove one/i)).toBeInTheDocument()
})
```

### Cascade Delete (Custom food in favorites)

```typescript
it('should remove from favorites when custom food is deleted', async () => {
  // Create custom food and add to favorites
  const food = await createAndFavoriteCustomFood('Test Food')
  
  // Delete custom food
  await deleteCustomFood(food.id)
  
  // Verify no longer in favorites
  expect(await isFavorited(userId, 'custom', food.id)).toBe(false)
})
```

---

## Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Search response time | < 100ms | `performance.now()` before/after |
| Search-to-selection flow | < 15s | Manual stopwatch |
| Favorite-to-log flow | < 5s | Manual stopwatch |
| Heart icon feedback | < 100ms | Verify immediate visual change |

---

## Acceptance Test Checklist

- [ ] AT-001: Search "phở" returns all phở variants, Vietnamese first
- [ ] AT-002: Search "rice" returns rice dishes from name_en
- [ ] AT-003: Empty search + focus shows recent search chips
- [ ] AT-004: Select search result saves to recent searches
- [ ] AT-005: Manual entry with valid data logs food, shows toast
- [ ] AT-006: Manual entry + save as custom appears in search results
- [ ] AT-007: Create 31st custom food shows limit prompt
- [ ] AT-008: Tap heart on food toggles favorite status
- [ ] AT-009: Add 21st favorite shows limit prompt with selection
- [ ] AT-010: Delete favorited custom food removes from favorites
- [ ] AT-011: Re-log from recent moves item to top of recent list
- [ ] AT-012: Log deleted custom food from recent uses snapshot values
