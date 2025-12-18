/**
 * FoodTileGrid - Main grid display for food selection.
 * Shows Recent Items section (max 8) at top, followed by category-grouped foods.
 * Uses 2-column grid layout optimized for mobile.
 */

import { useMemo } from 'react'
import { FoodTile } from './FoodTile'
import { getCategoryEmoji } from '@/lib/food-emoji'
import type { FoodItem, RecentItem, FoodCategory } from '@/types'

interface FoodTileGridProps {
  allFoods: FoodItem[]
  recentItems: RecentItem[]
  onSelectFood: (food: FoodItem) => void
  disabledFoodId?: string | null
}

// Category display order with English labels.
// Emojis are sourced from the shared food-emoji config so filters
// always mirror the same visuals as cards and tiles.
const CATEGORY_ORDER: { id: FoodCategory; label: string }[] = [
  { id: 'noodles', label: 'Noodles' },
  { id: 'rice', label: 'Rice' },
  { id: 'banh_mi', label: 'Banh Mi' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'clean_eating', label: 'Clean Eating' },
]

export function FoodTileGrid({ allFoods, recentItems, onSelectFood, disabledFoodId }: FoodTileGridProps) {
  // Map food IDs to food objects for quick lookup
  const foodMap = useMemo(() => {
    return new Map(allFoods.map((food) => [food.id, food]))
  }, [allFoods])

  // Resolve recent items to full food objects (filter out any stale references)
  const recentFoods = useMemo(() => {
    return recentItems
      .map((item) => foodMap.get(item.foodId))
      .filter((food): food is FoodItem => food !== undefined)
  }, [recentItems, foodMap])

  // Group foods by category for organized display
  const foodsByCategory = useMemo(() => {
    const grouped = new Map<string, FoodItem[]>()
    
    CATEGORY_ORDER.forEach(({ id }) => {
      grouped.set(id, [])
    })
    
    allFoods.forEach((food) => {
      const categoryFoods = grouped.get(food.category)
      if (categoryFoods) {
        categoryFoods.push(food)
      }
    })
    
    return grouped
  }, [allFoods])

  return (
    <div className="space-y-6 pb-24">
      {/* Recent Items Section - only show if user has logged foods before */}
      {recentFoods.length > 0 && (
        <section>
          <h2 className="text-title text-foreground mb-3 px-1">
            Recent
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {recentFoods.map((food) => (
              <FoodTile
                key={`recent-${food.id}`}
                food={food}
                onSelect={onSelectFood}
                disabled={food.id === disabledFoodId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category-grouped Food Grid */}
      {CATEGORY_ORDER.map(({ id, label }) => {
        const foods = foodsByCategory.get(id) || []
        if (foods.length === 0) return null

        const emoji = getCategoryEmoji(id)

        return (
          <section key={id}>
            <h2 className="text-title text-foreground mb-3 px-1">
              {emoji} {label}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {foods.map((food) => (
                <FoodTile
                  key={food.id}
                  food={food}
                  onSelect={onSelectFood}
                  disabled={food.id === disabledFoodId}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
