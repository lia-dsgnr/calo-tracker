/**
 * Category-to-emoji mapping for food items.
 * Single source of truth for all food emojis tied to FoodItem / FoodCategory.
 *
 * Components should call helpers in this file (getFoodEmoji / getCategoryEmoji)
 * instead of defining their own CATEGORY_EMOJI maps so visual changes stay
 * consistent across favorites, suggestions, search, templates, and the timeline.
 */

import type { FoodCategory } from '@/db/types'
import type { FoodItem } from '@/types'

// Emoji lists for each food category.
// The first emoji in each list is the default; additional entries allow
// future per-food specialisation without changing call sites.
const FOOD_CATEGORY_EMOJIS: Record<FoodCategory, string[]> = {
  noodles: ['🍜'],
  rice: ['🍚'],
  banh_mi: ['🥖'],
  snacks: ['🍿'],
  drinks: ['🧃'],
  desserts: ['🍰'],
  clean_eating: ['🥗'],
}

// Default emoji when category is unknown or lookup fails.
// Exported so components like the timeline can use the same fallback.
export const DEFAULT_EMOJI = '🍽️'

// Optional per-food overrides keyed by food id.
// Use this when a specific food item should always show a particular emoji.
const FOOD_EMOJI_OVERRIDES: Record<string, string> = {}

// Simple heuristic mappings from meal template names to emojis.
// This lets template cards share the same emoji configuration surface
// as the rest of the app instead of hard-coding values in the component.
const MEAL_NAME_EMOJIS: { match: RegExp; emoji: string }[] = [
  { match: /(breakfast|sáng)/i, emoji: '🌅' },
  { match: /(lunch|trưa)/i, emoji: '🍽️' },
  { match: /(dinner|tối)/i, emoji: '🌙' },
  { match: /(snack|ăn vặt)/i, emoji: '🍪' },
]

/**
 * Get emoji for a food category (category-only helpers).
 * Returns the first emoji configured for the category, or the default.
 */
export function getCategoryEmoji(category: FoodCategory | undefined): string {
  if (!category) return DEFAULT_EMOJI
 
  const emojis = FOOD_CATEGORY_EMOJIS[category]
  if (!emojis || emojis.length === 0) {
    return DEFAULT_EMOJI
  }

  return emojis[0]
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

/**
 * Get the most appropriate emoji for a specific food item.
 * 
 * Selection order:
 * - Per-food override by id (FOOD_EMOJI_OVERRIDES)
 * - First emoji from the food's category list (FOOD_CATEGORY_EMOJIS)
 * - Default fallback emoji when category is missing or unknown
 */
export function getFoodEmoji(
  food: Pick<FoodItem, 'id' | 'name_vi' | 'category'>
): string {
  // Allow bespoke emoji assignments for standout foods.
  const override = FOOD_EMOJI_OVERRIDES[food.id]
  if (override) {
    return override
  }

  // Fall back to category-based selection so most foods are covered
  // by simple configuration in FOOD_CATEGORY_EMOJIS.
  return getCategoryEmoji(food.category)
}

/**
 * Get emoji for a meal template based on its name.
 * Keeps template preview icons configurable in the same place as food emojis.
 */
export function getMealEmojiFromName(name: string): string {
  const match = MEAL_NAME_EMOJIS.find((rule) => rule.match.test(name))
  if (match) {
    return match.emoji
  }

  // When no rule matches, fall back to the default plate so templates
  // still feel like generic meals rather than using unrelated symbols.
  return DEFAULT_EMOJI
}
