/**
 * QuickAddPage - Main container for food logging flow.
 * Orchestrates: favorites grid, timeline, tile selection -> portion picker -> toast notification.
 * Manages debouncing, undo state, and database integration.
 */

import { useState, useCallback, useRef } from 'react'
import { FoodTileGrid } from './FoodTileGrid'
import { FavoritesGrid } from './FavoritesGrid'
import { TimelineSection } from './TimelineSection'
import { PortionPicker } from './PortionPicker'
import { Toast } from '@/components/common/Toast'
import { Dashboard } from '@/components/Dashboard'
import { useDatabaseStorage } from '@/hooks'
import { useDatabaseContext } from '@/contexts/useDatabaseContext'
import { recordFavoriteUse, getSystemFoodById } from '@/db'
import { trackEvent, calculateDaysAgo } from '@/lib/analytics'
import type { FoodItem, PortionSize, ToastState, LogEntry, FoodCategory } from '@/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

export function QuickAddPage() {
  // Database storage hook provides logs, recent items, and mutation functions
  const { recentItems, addFood, removeLog, dailySummary, goals } = useDatabaseStorage()
  const { currentUser } = useDatabaseContext()

  // Selected food for portion picker (null when picker is closed)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Track last added entry for undo functionality
  const lastEntryRef = useRef<LogEntry | null>(null)

  // Debounce ref to prevent rapid-fire tile taps
  const lastTapTimeRef = useRef<number>(0)

  // Track which food is currently being processed (for disabled state)
  const [processingFoodId, setProcessingFoodId] = useState<string | null>(null)

  /**
   * Handle food tile selection - opens portion picker with debouncing.
   */
  const handleSelectFood = useCallback((food: FoodItem) => {
    const now = Date.now()
    
    // Debounce: ignore taps within 200ms of the last tap
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) {
      return
    }
    lastTapTimeRef.current = now

    setSelectedFood(food)
    setProcessingFoodId(food.id)
  }, [])

  /**
   * Handle portion selection - logs the food and shows toast.
   * Also records favorite use if the food is favorited.
   */
  const handleSelectPortion = useCallback(
    async (portion: PortionSize) => {
      if (!selectedFood) return

      // Add food to log via storage hook
      const entry = await addFood(selectedFood, portion)
      if (!entry) return

      lastEntryRef.current = entry

      // Record favorite use if food is favorited (non-blocking)
      if (currentUser) {
        recordFavoriteUse(currentUser.id, 'system', selectedFood.id, portion).catch(
          (err) => console.error('Failed to record favorite use:', err)
        )
      }

      // Track analytics: favorite logged via tile tap
      trackEvent('favorite_logged', {
        food_id: selectedFood.id,
        portion,
        method: 'tap',
      })

      // Show success toast with undo option
      setToast({
        visible: true,
        message: `Added ${selectedFood.name_vi} (${portion})`,
        variant: 'success',
        undoAction: () => {
          // Undo action will be called via handleUndo
        },
      })

      // Close picker and clear processing state
      setSelectedFood(null)
      setProcessingFoodId(null)
    },
    [selectedFood, addFood, currentUser]
  )
  /**
   * Handle "Log Again" action from timeline - opens portion picker with same portion.
   * Fetches full food details from database to ensure accurate portion data.
   */
  const handleLogAgain = useCallback(
    async (log: LogEntry) => {
      // Fetch full food details from database
      const systemFood = await getSystemFoodById(log.foodId)
      if (!systemFood) {
        console.error('Food not found for log:', log.foodId)
        return
      }

      // Convert SystemFood to FoodItem format
      const food: FoodItem = {
        id: systemFood.id,
        name_vi: systemFood.nameVi,
        name_en: systemFood.nameEn,
        category: systemFood.category as FoodCategory,
        serving: systemFood.servingDescription ?? '',
        confidence: systemFood.confidence,
        portions: {
          S: {
            kcal: systemFood.kcalS,
            protein: systemFood.proteinS,
            fat: systemFood.fatS,
            carbs: systemFood.carbsS,
          },
          M: {
            kcal: systemFood.kcalM,
            protein: systemFood.proteinM,
            fat: systemFood.fatM,
            carbs: systemFood.carbsM,
          },
          L: {
            kcal: systemFood.kcalL,
            protein: systemFood.proteinL,
            fat: systemFood.fatL,
            carbs: systemFood.carbsL,
          },
        },
      }

      // Track analytics: timeline log again
      const daysAgo = calculateDaysAgo(log.timestamp)
      trackEvent('timeline_log_again', {
        food_id: log.foodId,
        days_ago: daysAgo,
      })

      setSelectedFood(food)
      setProcessingFoodId(food.id)
    },
    []
  )

  /**
   * Handle delete action from timeline - removes log entry.
   */
  const handleDeleteLog = useCallback(
    async (logId: string) => {
      await removeLog(logId)
      
      // Show toast with undo option
      setToast({
        visible: true,
        message: 'Removed from log',
        variant: 'undo',
        undoAction: () => {
          // Undo would restore the log (not implemented yet)
        },
      })
    },
    [removeLog]
  )

  /**
   * Handle portion picker close without selection.
   */
  const handleClosePicker = useCallback(() => {
    setSelectedFood(null)
    setProcessingFoodId(null)
  }, [])

  /**
   * Handle toast dismissal.
   */
  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  /**
   * Handle undo action - removes the last logged entry.
   */
  const handleUndo = useCallback(() => {
    if (lastEntryRef.current) {
      removeLog(lastEntryRef.current.id)
      lastEntryRef.current = null
    }
  }, [removeLog])

  return (
    <div className="min-h-screen bg-background">
      {/* Main content - scrollable sections */}
      <main className="px-4 py-6 space-y-8">
        {/* Dashboard: progress ring + today's meals */}
        <Dashboard
          dailySummary={dailySummary}
          goals={goals}
          onDeleteLog={removeLog}
        />
        {/* Quick Add section header */}
        <h2 className="text-title text-foreground">Quick Add</h2>

        {/* Favorites grid - top section.
            Quick-log for favorites is currently handled elsewhere, so we only pass tile tap handling here. */}
        <FavoritesGrid
          onSelectFood={handleSelectFood}
        />

        {/* Timeline section - recent meals */}
        <TimelineSection
          onLogAgain={handleLogAgain}
          onDelete={handleDeleteLog}
        />

        {/* Recent items grid - fallback for browsing */}
        <FoodTileGrid
          allFoods={[]}
          recentItems={recentItems}
          onSelectFood={handleSelectFood}
          disabledFoodId={processingFoodId}
        />
      </main>

      {/* Portion picker bottom sheet */}
      <PortionPicker
        food={selectedFood}
        isOpen={selectedFood !== null}
        onSelect={handleSelectPortion}
        onClose={handleClosePicker}
      />

      {/* Toast notification */}
      <Toast
        toast={toast}
        onClose={handleCloseToast}
        onUndo={handleUndo}
      />
    </div>
  )
}
