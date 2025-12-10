/**
 * App - Root component for Calo Tracker.
 * Combines Dashboard (progress + meal history) with QuickAdd (food logging).
 */

import { useState, useCallback, useRef } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { FoodTileGrid, PortionPicker } from '@/components/QuickAdd'
import { Toast } from '@/components/common'
import { useCaloStorage } from '@/hooks'
import type { FoodItem, PortionSize, ToastState, LogEntry } from '@/types'

// Debounce delay for tile taps to prevent accidental double-taps
const TAP_DEBOUNCE_MS = 200

function App() {
  const { dailySummary, goals, recentItems, addFood, removeLog } = useCaloStorage()

  // Portion picker state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [processingFoodId, setProcessingFoodId] = useState<string | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Refs for debouncing and undo
  const lastTapTimeRef = useRef<number>(0)
  const lastEntryRef = useRef<LogEntry | null>(null)

  const handleSelectFood = useCallback((food: FoodItem) => {
    const now = Date.now()
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) return
    lastTapTimeRef.current = now

    setSelectedFood(food)
    setProcessingFoodId(food.id)
  }, [])

  const handleSelectPortion = useCallback(
    (portion: PortionSize) => {
      if (!selectedFood) return

      const entry = addFood(selectedFood, portion)
      lastEntryRef.current = entry

      setToast({
        visible: true,
        message: `Added ${selectedFood.name_vi} (${portion})`,
        variant: 'success',
      })

      setSelectedFood(null)
      setProcessingFoodId(null)
    },
    [selectedFood, addFood]
  )

  const handleClosePicker = useCallback(() => {
    setSelectedFood(null)
    setProcessingFoodId(null)
  }, [])

  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleUndo = useCallback(() => {
    if (lastEntryRef.current) {
      removeLog(lastEntryRef.current.id)
      lastEntryRef.current = null
    }
  }, [removeLog])

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 space-y-8">
        {/* Progress summary and meal history */}
        <Dashboard
          dailySummary={dailySummary}
          goals={goals}
          onDeleteLog={removeLog}
        />

        {/* Quick add food grid */}
        <section>
          <h2 className="text-title text-foreground mb-4">Quick Add</h2>
          <FoodTileGrid
            recentItems={recentItems}
            onSelectFood={handleSelectFood}
            disabledFoodId={processingFoodId}
          />
        </section>
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

export default App
