/**
 * Category-to-emoji mapping for food items.
 * Provides visual identifiers for meal cards in the timeline.
 */

import type { FoodCategory } from '@/db/types'

// Emoji mapping for each food category
const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  noodles: '🍜',
  rice: '🍚',
  banh_mi: '🥖',
  snacks: '🍿',
  drinks: '🧃',
  desserts: '🍰',
  clean_eating: '🥗',
}

// Default emoji when category is unknown or lookup fails
const DEFAULT_EMOJI = '🍽️'

/**
 * Get emoji for a food category.
 * Returns default plate emoji if category is not found.
 */
export function getCategoryEmoji(category: FoodCategory | undefined): string {
  if (!category) return DEFAULT_EMOJI
  return CATEGORY_EMOJI[category] ?? DEFAULT_EMOJI
}

/**
 * Cache for food category lookups to avoid repeated database queries.
 * Maps foodId -> category for foods we've already looked up.
 */
export const foodCategoryCache = new Map<string, FoodCategory>()

/**
 * Store a food's category in the cache after lookup.
 */
export function cacheFoodCategory(
  foodId: string,
  category: FoodCategory
): void {
  foodCategoryCache.set(foodId, category)
}

/**
 * Get cached category for a food, if available.
 */
export function getCachedCategory(foodId: string): FoodCategory | undefined {
  return foodCategoryCache.get(foodId)
}
