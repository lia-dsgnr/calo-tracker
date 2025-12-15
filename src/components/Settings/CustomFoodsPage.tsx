/**
 * CustomFoodsPage - Management screen for user's custom foods.
 * Allows viewing, editing, and deleting custom foods.
 * Shows count indicator and handles cascade delete from favorites.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/contexts/useDatabaseContext'
import {
  getCustomFoodsByUser,
  getCustomFoodCount,
  updateCustomFood,
  deleteCustomFood,
} from '@/db/repositories/food-repository'
import { removeFavorite, isFavorited } from '@/db/repositories/favorite-repository'
import { DB_LIMITS } from '@/db/types'
import type { CustomFood } from '@/db/types'
import { Toast } from '@/components/common/Toast'
import type { ToastState } from '@/types'

interface CustomFoodsPageProps {
  onBack: () => void
  onAddNew: () => void
}

export function CustomFoodsPage({ onBack, onAddNew }: CustomFoodsPageProps) {
  const currentUser = useCurrentUser()

  // Custom foods state
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([])
  const [foodCount, setFoodCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Edit modal state
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null)

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })

  // Undo state for deletions
  const deletedFoodRef = useRef<CustomFood | null>(null)

  /**
   * Load custom foods on mount.
   */
  useEffect(() => {
    loadCustomFoods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Load custom foods from database.
   */
  const loadCustomFoods = useCallback(async () => {
    setIsLoading(true)
    try {
      const [foods, count] = await Promise.all([
        getCustomFoodsByUser(currentUser.id),
        getCustomFoodCount(currentUser.id),
      ])
      setCustomFoods(foods)
      setFoodCount(count)
    } catch (error) {
      console.error('Failed to load custom foods:', error)
      setToast({
        visible: true,
        message: 'Failed to load custom foods',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUser.id])

  /**
   * Handle edit button click.
   */
  const handleEdit = useCallback((food: CustomFood) => {
    setEditingFood(food)
  }, [])

  /**
   * Handle save edited food.
   */
  const handleSaveEdit = useCallback(
    async (updates: Partial<Pick<CustomFood, 'name' | 'kcal' | 'protein' | 'carbs' | 'fat'>>) => {
      if (!editingFood) return

      try {
        await updateCustomFood(editingFood.id, updates)
        await loadCustomFoods()
        setEditingFood(null)
        setToast({
          visible: true,
          message: `Updated ${updates.name || editingFood.name}`,
          variant: 'success',
        })
      } catch (error) {
        console.error('Failed to update custom food:', error)
        setToast({
          visible: true,
          message: 'Failed to update custom food',
          variant: 'error',
        })
      }
    },
    [editingFood, loadCustomFoods]
  )

  /**
   * Handle delete button click with cascade to favorites.
   */
  const handleDelete = useCallback(
    async (food: CustomFood) => {
      try {
        // Store for undo
        deletedFoodRef.current = food

        // Check if favorited and remove from favorites (cascade delete)
        const wasFavorited = await isFavorited(currentUser.id, 'custom', food.id)
        if (wasFavorited) {
          await removeFavorite(currentUser.id, 'custom', food.id)
        }

        // Soft delete the custom food
        await deleteCustomFood(food.id)

        // Refresh list
        await loadCustomFoods()

        // Show toast with undo option
        setToast({
          visible: true,
          message: wasFavorited
            ? `Deleted ${food.name} (removed from favorites)`
            : `Deleted ${food.name}`,
          variant: 'undo',
        })
      } catch (error) {
        console.error('Failed to delete custom food:', error)
        setToast({
          visible: true,
          message: 'Failed to delete custom food',
          variant: 'error',
        })
      }
    },
    [currentUser.id, loadCustomFoods]
  )

  /**
   * Handle undo delete.
   */
  const handleUndo = useCallback(async () => {
    // Note: In MVP, undo would require re-creating the food
    // For simplicity, we just show a message
    setToast({
      visible: true,
      message: 'Undo not available',
      variant: 'error',
    })
    deletedFoodRef.current = null
  }, [])

  /**
   * Handle toast close.
   */
  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-20 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-title text-foreground">Custom Foods</h1>
            <p className="text-caption text-foreground-muted">
              {foodCount} / {DB_LIMITS.MAX_CUSTOM_FOODS_PER_USER} foods
            </p>
          </div>
          {foodCount < DB_LIMITS.MAX_CUSTOM_FOODS_PER_USER && (
            <button
              type="button"
              onClick={onAddNew}
              className={cn(
                'p-2 rounded-full',
                'bg-primary text-primary-foreground',
                'hover:bg-primary-dark',
                'transition-colors'
              )}
              aria-label="Add new custom food"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-foreground-muted">Loading...</div>
          </div>
        ) : customFoods.length === 0 ? (
          <EmptyState onAddNew={onAddNew} />
        ) : (
          <ul className="space-y-3">
            {customFoods.map((food) => (
              <li key={food.id}>
                <CustomFoodCard
                  food={food}
                  onEdit={() => handleEdit(food)}
                  onDelete={() => handleDelete(food)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Edit Modal */}
      {editingFood && (
        <EditCustomFoodModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} onClose={handleCloseToast} onUndo={handleUndo} />
    </div>
  )
}

/**
 * Empty state component.
 */
function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-purple-20 flex items-center justify-center mb-4">
        <ChefHat size={24} className="text-purple-60" />
      </div>
      <p className="text-body text-foreground mb-2">No custom foods yet</p>
      <p className="text-caption text-foreground-muted mb-4">
        Create custom foods to quickly log meals you eat often
      </p>
      <button
        type="button"
        onClick={onAddNew}
        className={cn(
          'px-4 py-2 rounded-pill',
          'bg-primary text-primary-foreground',
          'text-body font-medium',
          'hover:bg-primary-dark',
          'transition-colors'
        )}
      >
        Add Custom Food
      </button>
    </div>
  )
}

/**
 * Custom food card component.
 */
function CustomFoodCard({
  food,
  onEdit,
  onDelete,
}: {
  food: CustomFood
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4',
        'bg-background-card rounded-card shadow-tile'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-foreground truncate">
          {food.name}
        </p>
        <p className="text-caption text-foreground-muted">
          {food.kcal} kcal
          {food.protein !== null && ` • ${food.protein}g protein`}
          {food.carbs !== null && ` • ${food.carbs}g carbs`}
          {food.fat !== null && ` • ${food.fat}g fat`}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-full hover:bg-gray-20 transition-colors"
          aria-label={`Edit ${food.name}`}
        >
          <Pencil size={18} className="text-foreground-muted" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-full hover:bg-gray-20 transition-colors"
          aria-label={`Delete ${food.name}`}
        >
          <Trash2 size={18} className="text-secondary" />
        </button>
      </div>
    </div>
  )
}

/**
 * Edit custom food modal.
 */
function EditCustomFoodModal({
  food,
  onClose,
  onSave,
}: {
  food: CustomFood
  onClose: () => void
  onSave: (updates: Partial<Pick<CustomFood, 'name' | 'kcal' | 'protein' | 'carbs' | 'fat'>>) => void
}) {
  const [name, setName] = useState(food.name)
  const [kcal, setKcal] = useState(String(food.kcal))
  const [protein, setProtein] = useState(food.protein !== null ? String(food.protein) : '')
  const [carbs, setCarbs] = useState(food.carbs !== null ? String(food.carbs) : '')
  const [fat, setFat] = useState(food.fat !== null ? String(food.fat) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // Validate
      const newErrors: Record<string, string> = {}
      if (!name.trim()) newErrors.name = 'Name is required'
      const kcalNum = parseFloat(kcal)
      if (!kcal.trim() || isNaN(kcalNum) || kcalNum <= 0) {
        newErrors.kcal = 'Calories must be positive'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      onSave({
        name: name.trim(),
        kcal: Math.round(kcalNum),
        protein: protein.trim() ? parseFloat(protein) : null,
        carbs: carbs.trim() ? parseFloat(carbs) : null,
        fat: fat.trim() ? parseFloat(fat) : null,
      })
    },
    [name, kcal, protein, carbs, fat, onSave]
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-background-card rounded-t-sheet shadow-sheet',
          'animate-slide-up safe-bottom'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-title text-foreground">Edit Custom Food</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-body font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'w-full h-12 px-4 rounded-input',
                'bg-background border border-border',
                'text-body text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-caption text-secondary">{errors.name}</p>
            )}
          </div>

          {/* Calories */}
          <div>
            <label className="block text-body font-medium text-foreground mb-2">
              Calories (kcal)
            </label>
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              className={cn(
                'w-full h-12 px-4 rounded-input',
                'bg-background border border-border',
                'text-body text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />
            {errors.kcal && (
              <p className="mt-1 text-caption text-secondary">{errors.kcal}</p>
            )}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-caption text-foreground-muted mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className={cn(
                  'w-full h-10 px-3 rounded-input',
                  'bg-background border border-border',
                  'text-body text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
            <div>
              <label className="block text-caption text-foreground-muted mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className={cn(
                  'w-full h-10 px-3 rounded-input',
                  'bg-background border border-border',
                  'text-body text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
            <div>
              <label className="block text-caption text-foreground-muted mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className={cn(
                  'w-full h-10 px-3 rounded-input',
                  'bg-background border border-border',
                  'text-body text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 h-12 rounded-pill',
                'bg-gray-20 text-foreground',
                'text-body font-medium',
                'hover:bg-gray-30',
                'transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                'flex-1 h-12 rounded-pill',
                'bg-primary text-primary-foreground',
                'text-body font-medium',
                'hover:bg-primary-dark',
                'transition-colors'
              )}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
