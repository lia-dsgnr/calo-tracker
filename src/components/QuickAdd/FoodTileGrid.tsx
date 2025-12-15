/**
 * FoodTileGrid - Main grid display for food selection.
 * Shows Recent Items section (max 8) at top, followed by category-grouped foods.
 * Uses 2-column grid layout optimized for mobile.
 */

import { useMemo } from 'react'
import { FoodTile } from './FoodTile'
import type { FoodItem, RecentItem } from '@/types'
import type { FoodType } from '@/db/types'

interface FoodTileGridProps {
  allFoods: FoodItem[]
  recentItems: RecentItem[]
  onSelectFood: (food: FoodItem) => void
  disabledFoodId?: string | null
  /** When true, only shows recent items without category sections */
  showOnlyRecent?: boolean
  /** When true, hides the Recent section (used for "All" tab) */
  hideRecent?: boolean
  /** Set of favorited food IDs for checking favorite status */
  favoritedFoodIds?: Set<string>
  /** Callback when heart icon is clicked on a food tile */
  onFavoriteToggle?: (food: FoodItem, foodType: FoodType) => void
  /** Custom foods to display as a separate category */
  customFoods?: FoodItem[]
}

// Category display order with English labels and emojis
const CATEGORY_ORDER = [
  { id: 'noodles', label: 'Noodles', emoji: '🍜' },
  { id: 'rice', label: 'Rice', emoji: '🍚' },
  { id: 'banh_mi', label: 'Banh Mi', emoji: '🥖' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'drinks', label: 'Drinks', emoji: '🧃' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
  { id: 'clean_eating', label: 'Clean Eating', emoji: '🥗' },
] as const

export function FoodTileGrid({ 
  allFoods, 
  recentItems, 
  onSelectFood, 
  disabledFoodId, 
  showOnlyRecent = false,
  hideRecent = false,
  favoritedFoodIds,
  onFavoriteToggle,
  customFoods = [],
}: FoodTileGridProps) {
  // Map food IDs to food objects for quick lookup (includes both system and custom foods)
  const foodMap = useMemo(() => {
    const map = new Map(allFoods.map((food) => [food.id, food]))
    // Add custom foods to the map
    customFoods.forEach((food) => {
      map.set(food.id, food)
    })
    return map
  }, [allFoods, customFoods])

  // Track which foods are custom for proper foodType handling
  const customFoodIds = useMemo(() => {
    return new Set(customFoods.map((food) => food.id))
  }, [customFoods])

  // Resolve recent items to full food objects (filter out any stale references)
  // Includes both system and custom foods
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

  // Show only recent items when in Recent tab
  if (showOnlyRecent) {
    if (recentFoods.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-body text-foreground-muted">
            No recent foods yet
          </p>
          <p className="text-caption text-foreground-muted mt-1">
            Start logging to see them here
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-6 pb-24">
        <section>
          <h2 className="text-title text-foreground mb-3 px-1">
            Recent
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {recentFoods.map((food) => {
              const isCustom = customFoodIds.has(food.id)
              return (
                <FoodTile
                  key={`recent-${food.id}`}
                  food={food}
                  onSelect={onSelectFood}
                  disabled={food.id === disabledFoodId}
                  isFavorited={favoritedFoodIds?.has(food.id)}
                  onFavoriteToggle={onFavoriteToggle}
                  foodType={isCustom ? 'custom' : 'system'}
                  sourceBadge={isCustom ? 'Custom' : undefined}
                />
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Recent Items Section - only show if user has logged foods before and not hidden */}
      {!hideRecent && recentFoods.length > 0 && (
        <section>
          <h2 className="text-title text-foreground mb-3 px-1">
            Recent
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {recentFoods.map((food) => {
              const isCustom = customFoodIds.has(food.id)
              return (
                <FoodTile
                  key={`recent-${food.id}`}
                  food={food}
                  onSelect={onSelectFood}
                  disabled={food.id === disabledFoodId}
                  isFavorited={favoritedFoodIds?.has(food.id)}
                  onFavoriteToggle={onFavoriteToggle}
                  foodType={isCustom ? 'custom' : 'system'}
                  sourceBadge={isCustom ? 'Custom' : undefined}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Custom Foods Section - shown before category sections */}
      {customFoods.length > 0 && (
        <section>
          <h2 className="text-title text-foreground mb-3 px-1">
            ⭐ My Dishes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {customFoods.map((food) => (
              <FoodTile
                key={`custom-${food.id}`}
                food={food}
                onSelect={onSelectFood}
                disabled={food.id === disabledFoodId}
                isFavorited={favoritedFoodIds?.has(food.id)}
                onFavoriteToggle={onFavoriteToggle}
                foodType="custom"
                sourceBadge="Custom"
              />
            ))}
          </div>
        </section>
      )}

      {/* Category-grouped Food Grid */}
      {CATEGORY_ORDER.map(({ id, label, emoji }) => {
        const foods = foodsByCategory.get(id) || []
        if (foods.length === 0) return null

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
                  isFavorited={favoritedFoodIds?.has(food.id)}
                  onFavoriteToggle={onFavoriteToggle}
                  foodType="system"
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
