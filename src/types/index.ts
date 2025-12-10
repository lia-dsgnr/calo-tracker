/**
 * Core data types for the Calo Tracker app
 * These define the shape of food items, logs, and user goals
 */

// Portion size options: Small, Medium, Large
export type PortionSize = 'S' | 'M' | 'L'

// Nutritional values for a specific portion size
export interface PortionNutrition {
  kcal: number
  protein: number
  fat: number
  carbs: number
}

// Complete food item with all portion variants
export interface FoodItem {
  id: string
  name_vi: string      // Vietnamese name (displayed to users)
  name_en: string      // English name (for reference)
  category: FoodCategory
  portions: {
    S: PortionNutrition
    M: PortionNutrition
    L: PortionNutrition
  }
  serving: string      // Description like "1 bowl (450g)"
  confidence: number   // Data confidence score (0-1)
}

// Food categories for organizing the dataset
export type FoodCategory =
  | 'noodles'
  | 'rice'
  | 'banh_mi'
  | 'snacks'
  | 'drinks'
  | 'desserts'
  | 'clean_eating'

// A single logged meal entry
export interface LogEntry {
  id: string
  foodId: string
  name_vi: string      // Denormalized for display without lookup
  portion: PortionSize
  kcal: number
  protein: number
  carbs: number
  fat: number
  timestamp: number    // Unix timestamp in milliseconds
}

// User's daily nutrition goals (mocked for MVP)
export interface DailyGoals {
  dailyKcal: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
}

// Aggregated daily totals for dashboard display
export interface DailySummary {
  consumedKcal: number
  consumedProtein: number
  consumedCarbs: number
  consumedFat: number
  remainingKcal: number
  remainingProtein: number
  logs: LogEntry[]
}

// Recent items stored in localStorage
export interface RecentItem {
  foodId: string
  name_vi: string
  lastLogged: number
}

// Toast notification types for user feedback
export type ToastVariant = 'success' | 'undo' | 'error'

export interface ToastState {
  visible: boolean
  message: string
  variant: ToastVariant
  undoAction?: () => void
}

// App state for context/store
export interface AppState {
  logs: LogEntry[]
  recentItems: RecentItem[]
  goals: DailyGoals
  isOffline: boolean
}
