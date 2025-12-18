/**
 * Database entity types for Calo Tracker SQLite schema.
 * These types mirror the database tables and are used throughout the app.
 */

// Portion sizes for system foods
export type PortionSize = 'S' | 'M' | 'L'

// Portion type including custom foods (single portion only)
export type LogPortionType = PortionSize | 'single'

// Food source type: system database or user-created
export type FoodType = 'system' | 'custom'

// Food categories matching system_food.category
export type FoodCategory =
  | 'noodles'
  | 'rice'
  | 'banh_mi'
  | 'snacks'
  | 'drinks'
  | 'desserts'
  | 'clean_eating'

/**
 * User profile entity
 * Stores user preferences and daily nutrition goals
 */
export interface UserProfile {
  id: string
  displayName: string | null
  dailyKcalGoal: number
  dailyProteinGoal: number
  dailyCarbsGoal: number
  dailyFatGoal: number
  createdAt: number
  updatedAt: number
}

/**
 * System food entity
 * Curated Vietnamese food database with S/M/L portions
 */
export interface SystemFood {
  id: string
  nameVi: string
  nameEn: string
  category: FoodCategory
  servingDescription: string | null
  confidence: number
  // Small portion
  kcalS: number
  proteinS: number
  fatS: number
  carbsS: number
  fibreS: number | null
  sugarS: number | null
  sodiumS: number | null
  // Medium portion
  kcalM: number
  proteinM: number
  fatM: number
  carbsM: number
  fibreM: number | null
  sugarM: number | null
  sodiumM: number | null
  // Large portion
  kcalL: number
  proteinL: number
  fatL: number
  carbsL: number
  fibreL: number | null
  sugarL: number | null
  sodiumL: number | null
  isActive: boolean
}

/**
 * Custom food entity
 * User-created foods with single portion (no S/M/L)
 */
export interface CustomFood {
  id: string
  userId: string
  name: string
  kcal: number
  protein: number | null
  fat: number | null
  carbs: number | null
  fibre: number | null
  sugar: number | null
  sodium: number | null
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

/**
 * Food log entry entity
 * Individual meal entries with snapshot of nutrition data
 */
export interface FoodLog {
  id: string
  userId: string
  foodType: FoodType
  foodId: string
  portion: LogPortionType
  nameSnapshot: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  loggedDate: string // YYYY-MM-DD format
  loggedAt: number
  deletedAt: number | null
}

/**
 * Favorite entity
 * User's saved favorite foods for quick access
 */
export interface Favorite {
  id: string
  userId: string
  foodType: FoodType
  foodId: string
  sortOrder: number
  defaultPortion: LogPortionType
  useCount: number
  lastUsedAt: number | null
  createdAt: number
  deletedAt: number | null
}

/**
 * Recent search entity
 * Last 5 search terms per user
 */
export interface RecentSearch {
  id: number
  userId: string
  searchTerm: string
  searchedAt: number
}

/**
 * Daily summary entity
 * Pre-computed daily totals for fast statistics
 */
export interface DailySummary {
  id: number
  userId: string
  date: string // YYYY-MM-DD format
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  logCount: number
  goalKcal: number | null
  goalProtein: number | null
  updatedAt: number
}

/**
 * Schema version entity
 * Tracks database migrations
 */
export interface SchemaVersion {
  version: number
  appliedAt: number
  description: string | null
}

/**
 * Meal template entity
 * Reusable multi-item meal definitions for quick logging
 */
export interface MealTemplate {
  id: string
  userId: string
  name: string
  description: string | null
  totalKcal: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  useCount: number
  lastUsedAt: number | null
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

/**
 * Template item entity
 * Individual food items within a meal template
 */
export interface TemplateItem {
  id: string
  templateId: string
  foodType: FoodType
  foodId: string
  portion: LogPortionType
  nameSnapshot: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  isRequired: boolean
  sortOrder: number
}

// Database capacity limits (per plan spec)
export const DB_LIMITS = {
  MAX_USERS: 10,
  MAX_CUSTOM_FOODS_PER_USER: 30,
  MAX_FAVORITES_PER_USER: 20,
  MAX_TEMPLATES_PER_USER: 10,
  MAX_ITEMS_PER_TEMPLATE: 8,
  MAX_RECENT_SEARCHES: 5,
  MAX_LOGS_PER_DAY: 30,
  LOG_RETENTION_DAYS: 30,
  SUMMARY_RETENTION_DAYS: 90,
  MAX_SYSTEM_FOODS: 500,
} as const
