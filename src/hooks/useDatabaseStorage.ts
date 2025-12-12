/**
 * Database-backed storage hook for Calo Tracker.
 * Replaces useCaloStorage with SQLite persistence.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import {
  getAllSystemFoods,
  getTodayLogs as dbGetTodayLogs,
  createLog,
  deleteLog,
  getRecentLogs,
} from '../db'
import type { SystemFood, FoodLog } from '../db/types'
import type {
  FoodItem,
  LogEntry,
  RecentItem,
  DailyGoals,
  DailySummary,
  PortionSize,
  FoodCategory,
} from '../types'

interface UseDatabaseStorageReturn {
  // State
  todayLogs: LogEntry[]
  recentItems: RecentItem[]
  goals: DailyGoals
  dailySummary: DailySummary
  allFoods: FoodItem[]

  // Loading state
  isLoading: boolean

  // Actions
  addFood: (food: FoodItem, portion: PortionSize) => Promise<LogEntry | null>
  removeLog: (entryId: string) => Promise<void>
}

// Map SystemFood (DB) → FoodItem (UI)
function toFoodItem(sf: SystemFood): FoodItem {
  return {
    id: sf.id,
    name_vi: sf.nameVi,
    name_en: sf.nameEn,
    category: sf.category as FoodCategory,
    serving: sf.servingDescription ?? '',
    confidence: sf.confidence,
    portions: {
      S: { kcal: sf.kcalS, protein: sf.proteinS, fat: sf.fatS, carbs: sf.carbsS },
      M: { kcal: sf.kcalM, protein: sf.proteinM, fat: sf.fatM, carbs: sf.carbsM },
      L: { kcal: sf.kcalL, protein: sf.proteinL, fat: sf.fatL, carbs: sf.carbsL },
    },
  }
}

// Map FoodLog (DB) → LogEntry (UI)
function toLogEntry(log: FoodLog): LogEntry {
  return {
    id: log.id,
    foodId: log.foodId,
    name_vi: log.nameSnapshot,
    portion: log.portion as PortionSize,
    kcal: log.kcal,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    timestamp: log.loggedAt,
  }
}

// Derive recent items from logs (last 8 unique foods)
function deriveRecentItems(logs: FoodLog[]): RecentItem[] {
  const seen = new Map<string, RecentItem>()

  // Sort by logged_at desc to get most recent first
  const sorted = [...logs].sort((a, b) => b.loggedAt - a.loggedAt)

  for (const log of sorted) {
    if (!seen.has(log.foodId) && seen.size < 8) {
      seen.set(log.foodId, {
        foodId: log.foodId,
        name_vi: log.nameSnapshot,
        lastLogged: log.loggedAt,
      })
    }
  }

  return Array.from(seen.values())
}

const DEFAULT_GOALS: DailyGoals = {
  dailyKcal: 1800,
  dailyProtein: 75,
  dailyCarbs: 200,
  dailyFat: 60,
}

export function useDatabaseStorage(): UseDatabaseStorageReturn {
  const { currentUser, isInitialised } = useDatabaseContext()

  // State
  const [allFoods, setAllFoods] = useState<FoodItem[]>([])
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([])
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Goals from user profile
  const goals: DailyGoals = useMemo(() => {
    if (!currentUser) return DEFAULT_GOALS
    return {
      dailyKcal: currentUser.dailyKcalGoal,
      dailyProtein: currentUser.dailyProteinGoal,
      dailyCarbs: currentUser.dailyCarbsGoal,
      dailyFat: currentUser.dailyFatGoal,
    }
  }, [currentUser])

  // Daily summary derived from today's logs
  const dailySummary: DailySummary = useMemo(() => {
    const consumedKcal = todayLogs.reduce((sum, log) => sum + log.kcal, 0)
    const consumedProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0)
    const consumedCarbs = todayLogs.reduce((sum, log) => sum + log.carbs, 0)
    const consumedFat = todayLogs.reduce((sum, log) => sum + log.fat, 0)

    return {
      consumedKcal,
      consumedProtein,
      consumedCarbs,
      consumedFat,
      remainingKcal: goals.dailyKcal - consumedKcal,
      remainingProtein: goals.dailyProtein - consumedProtein,
      remainingCarbs: goals.dailyCarbs - consumedCarbs,
      remainingFat: goals.dailyFat - consumedFat,
      logs: todayLogs,
    }
  }, [todayLogs, goals])

  // Load data from database
  const loadData = useCallback(async () => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      // Load foods and logs in parallel
      const [systemFoods, dbTodayLogs, dbRecentLogs] = await Promise.all([
        getAllSystemFoods(),
        dbGetTodayLogs(currentUser.id),
        getRecentLogs(currentUser.id, 7),
      ])

      setAllFoods(systemFoods.map(toFoodItem))
      setTodayLogs(dbTodayLogs.map(toLogEntry))
      setRecentItems(deriveRecentItems(dbRecentLogs))
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  // Load data on init
  useEffect(() => {
    if (isInitialised && currentUser) {
      loadData()
    }
  }, [isInitialised, currentUser, loadData])

  // Add food action
  const addFood = useCallback(
    async (food: FoodItem, portion: PortionSize): Promise<LogEntry | null> => {
      if (!currentUser) return null

      const nutrition = food.portions[portion]

      const log = await createLog({
        userId: currentUser.id,
        foodType: 'system',
        foodId: food.id,
        portion,
        nameSnapshot: food.name_vi,
        kcal: nutrition.kcal,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
      })

      if (!log) return null

      const entry = toLogEntry(log)

      // Update local state immediately
      setTodayLogs((prev) => [entry, ...prev])
      setRecentItems((prev) => {
        const filtered = prev.filter((item) => item.foodId !== food.id)
        return [
          { foodId: food.id, name_vi: food.name_vi, lastLogged: log.loggedAt },
          ...filtered,
        ].slice(0, 8)
      })

      return entry
    },
    [currentUser]
  )

  // Remove log action
  const removeLog = useCallback(async (entryId: string): Promise<void> => {
    await deleteLog(entryId)

    // Update local state
    setTodayLogs((prev) => prev.filter((log) => log.id !== entryId))
  }, [])

  return {
    todayLogs,
    recentItems,
    goals,
    dailySummary,
    allFoods,
    isLoading,
    addFood,
    removeLog,
  }
}
