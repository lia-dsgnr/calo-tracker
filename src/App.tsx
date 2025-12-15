/**
 * App - Root component for Calo Tracker.
 * Combines Dashboard (progress + meal history) with QuickAdd (food logging with search).
 */

import { Dashboard } from '@/components/Dashboard'
import { QuickAddPage } from '@/components/QuickAdd'
import { useDatabaseStorage } from '@/hooks'

function App() {
  // Single source of truth for storage - shared between Dashboard and QuickAddPage
  // This ensures MealList updates in real-time when food is added
  const { dailySummary, goals, removeLog, recentItems, addFood } = useDatabaseStorage()

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 space-y-8">
        {/* Progress summary and meal history */}
        <Dashboard
          dailySummary={dailySummary}
          goals={goals}
          onDeleteLog={removeLog}
        />

        {/* Quick Add with integrated search feature */}
        <QuickAddPage
          recentItems={recentItems}
          addFood={addFood}
          removeLog={removeLog}
        />
      </main>
    </div>
  )
}

export default App
