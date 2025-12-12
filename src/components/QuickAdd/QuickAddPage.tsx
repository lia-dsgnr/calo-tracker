/**
 * QuickAddPage - Main container for food logging flow.
 * Orchestrates: tile selection -> portion picker -> toast notification.
 * Manages debouncing, undo state, and localStorage integration.
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { FoodTileGrid } from './FoodTileGrid'
import { PortionPicker } from './PortionPicker'
import { Toast } from '@/components/common/Toast'
import { useCaloStorage } from '@/hooks'
import { formatNumber } from '@/lib/utils'
import type { FoodItem, PortionSize, ToastState, LogEntry } from '@/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

export function QuickAddPage() {
  // Storage hook provides logs, recent items, and mutation functions
  const { recentItems, addFood, removeLog, dailySummary, goals } = useCaloStorage()

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
   */
  const handleSelectPortion = useCallback(
    (portion: PortionSize) => {
      if (!selectedFood) return

      // Add food to log via storage hook
      const entry = addFood(selectedFood, portion)
      lastEntryRef.current = entry

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
    [selectedFood, addFood]
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

  // Calculate progress display values
  const progressPercent = useMemo(() => {
    return Math.min(100, (dailySummary.consumedKcal / goals.dailyKcal) * 100)
  }, [dailySummary.consumedKcal, goals.dailyKcal])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with daily progress summary */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-4">
          <h1 className="text-headline text-foreground mb-2">
            Quick Add
          </h1>
          
          {/* Daily progress bar - condensed view */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-caption text-foreground-muted whitespace-nowrap">
              {formatNumber(dailySummary.consumedKcal)} / {formatNumber(goals.dailyKcal)} kcal
            </span>
          </div>
        </div>
      </header>

      {/* Main content - scrollable food grid */}
      <main className="px-5 py-6">
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
