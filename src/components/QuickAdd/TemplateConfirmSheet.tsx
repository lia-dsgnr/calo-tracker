/**
 * TemplateConfirmSheet - Bottom sheet for confirming template logging.
 * Shows all template items with checkboxes (required items locked),
 * allows adjusting portions, and "Log All" button to create multiple logs.
 * 
 * Used when user taps a TemplateCard to log a template.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { BottomSheet } from '@/components/common'
import { cn } from '@/lib/utils'
import type { MealTemplate, TemplateItem, LogPortionType } from '@/db/types'
import type { PortionSize } from '@/types'

interface TemplateConfirmSheetProps {
  template: MealTemplate
  items: TemplateItem[]
  isOpen: boolean
  onClose: () => void
  onConfirm: (selections: ItemSelection[]) => Promise<void>
}

/**
 * Selection state for each template item.
 * Tracks whether item is selected (for optional items) and portion adjustment.
 */
interface ItemSelection {
  itemId: string
  selected: boolean
  portion: LogPortionType
  // Adjusted nutrition values if portion changed (optional, recalculate if needed)
}

/**
 * Bottom sheet for confirming and optionally editing template before logging.
 * Allows toggling optional items and adjusting portions.
 */
export function TemplateConfirmSheet({
  template,
  items,
  isOpen,
  onClose,
  onConfirm,
}: TemplateConfirmSheetProps) {
  // Track selected items and portion adjustments
  // Initialize: all items selected, use template portions
  const [selections, setSelections] = useState<Map<string, ItemSelection>>(() => {
    const initial = new Map<string, ItemSelection>()
    items.forEach((item) => {
      initial.set(item.id, {
        itemId: item.id,
        selected: true,
        portion: item.portion,
      })
    })
    return initial
  })

  // Reset selections when template changes (re-initialize on open)
  useEffect(() => {
    if (!isOpen) return // Only reset when sheet opens

    const reset = new Map<string, ItemSelection>()
    items.forEach((item) => {
      reset.set(item.id, {
        itemId: item.id,
        selected: true,
        portion: item.portion,
      })
    })
    setSelections(reset)
  }, [isOpen, template.id, items])

  // Handle toggling optional items (required items cannot be toggled)
  const handleToggleItem = useCallback((itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item || item.isRequired) return // Cannot toggle required items

    setSelections((prev) => {
      const updated = new Map(prev)
      const current = updated.get(itemId)
      if (current) {
        updated.set(itemId, {
          ...current,
          selected: !current.selected,
        })
      }
      return updated
    })
  }, [items])

  // Handle portion change (only for system foods with S/M/L portions)
  const handlePortionChange = useCallback((itemId: string, portion: LogPortionType) => {
    setSelections((prev) => {
      const updated = new Map(prev)
      const current = updated.get(itemId)
      if (current) {
        updated.set(itemId, {
          ...current,
          portion,
        })
      }
      return updated
    })
  }, [])

  // Calculate totals from selected items
  const totals = useMemo(() => {
    let kcal = 0
    let protein = 0
    let fat = 0
    let carbs = 0

    items.forEach((item) => {
      const selection = selections.get(item.id)
      if (selection && selection.selected) {
        // Use template item nutrition (snapshot values)
        // Note: In a real implementation, you'd need to recalculate if portion changed
        // For MVP, we use the snapshot values as-is
        kcal += item.kcal
        protein += item.protein
        fat += item.fat
        carbs += item.carbs
      }
    })

    return { kcal, protein, fat, carbs }
  }, [items, selections])

  // Handle confirm: convert selections to array and call onConfirm
  const handleConfirm = useCallback(async () => {
    const selectionArray = Array.from(selections.values()).filter((s) => s.selected)
    await onConfirm(selectionArray)
    onClose()
  }, [selections, onConfirm, onClose])

  // Count selected items
  const selectedCount = useMemo(() => {
    return Array.from(selections.values()).filter((s) => s.selected).length
  }, [selections])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={template.name}
      description={`Confirm items to log from ${template.name}`}
      size="auto"
      showDragHandle={true}
    >
      <div className="space-y-4">
        {/* Template items list */}
        <div className="space-y-3">
          {items.map((item) => {
            const selection = selections.get(item.id)
            const isSelected = selection?.selected ?? true

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-card bg-background border border-border',
                  !isSelected && 'opacity-50'
                )}
              >
                {/* Checkbox (disabled for required items) */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleItem(item.id)}
                  disabled={item.isRequired}
                  className={cn(
                    'mt-1 w-4 h-4 rounded border-border',
                    'focus:ring-2 focus:ring-ring',
                    item.isRequired && 'cursor-not-allowed opacity-50'
                  )}
                  aria-label={
                    item.isRequired
                      ? `${item.nameSnapshot} (required)`
                      : `Toggle ${item.nameSnapshot}`
                  }
                />

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-medium text-foreground">
                      {item.nameSnapshot}
                    </span>
                    {item.isRequired && (
                      <span className="text-caption text-foreground-muted">(required)</span>
                    )}
                  </div>

                  {/* Portion selector (only for system foods with S/M/L) */}
                  {item.foodType === 'system' && item.portion !== 'single' && (
                    <div className="flex gap-2 mt-2">
                      {(['S', 'M', 'L'] as PortionSize[]).map((size) => {
                        const isActive = selection?.portion === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handlePortionChange(item.id, size)}
                            className={cn(
                              'px-3 py-1 rounded-pill text-caption font-medium transition-all',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-20 text-foreground-muted hover:bg-gray-30'
                            )}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Nutrition snapshot */}
                  <div className="mt-2 text-caption text-foreground-muted">
                    {item.kcal} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary totals */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-body font-medium text-foreground">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </span>
            <span className="text-body font-semibold text-foreground">
              {totals.kcal} kcal
            </span>
          </div>
          <div className="text-caption text-foreground-muted">
            Protein: {totals.protein.toFixed(1)}g • Carbs: {totals.carbs.toFixed(1)}g • Fat:{' '}
            {totals.fat.toFixed(1)}g
          </div>
        </div>

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
          className={cn(
            'w-full py-4 px-4 rounded-pill font-medium text-body',
            'bg-primary text-primary-foreground',
            'hover:bg-primary-dark active:scale-[0.98]',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            selectedCount === 0 && 'opacity-50 cursor-not-allowed'
          )}
        >
          Log All ({selectedCount})
        </button>
      </div>
    </BottomSheet>
  )
}


