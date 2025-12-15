/**
 * LimitPrompt - Reusable dialog for handling item limits.
 * Used when user reaches 30 custom foods or 20 favorites limit.
 * Shows current items and allows user to remove one to make space.
 */

import { useCallback } from 'react'
import { X, Heart, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'

// Item to display in the limit prompt
export interface LimitPromptItem {
  id: string
  name: string
  kcal?: number
}

type LimitType = 'favorites' | 'custom_foods'

interface LimitPromptProps {
  isOpen: boolean
  onClose: () => void
  type: LimitType
  items: LimitPromptItem[]
  onRemoveItem: (item: LimitPromptItem) => void
  /** Name of the item being added (for context) */
  newItemName?: string
}

const LIMIT_CONFIG = {
  favorites: {
    title: 'Favorites limit reached',
    description: 'You have 20 favorites. Remove one to add',
    icon: Heart,
    iconColor: 'text-secondary',
    iconBg: 'bg-orange-20',
    actionLabel: 'Remove',
    max: 20,
  },
  custom_foods: {
    title: 'Custom foods limit reached',
    description: 'You have 30 custom foods. Manage your list to add more.',
    icon: ChefHat,
    iconColor: 'text-purple-60',
    iconBg: 'bg-purple-20',
    actionLabel: 'Delete',
    max: 30,
  },
}

export function LimitPrompt({
  isOpen,
  onClose,
  type,
  items,
  onRemoveItem,
  newItemName,
}: LimitPromptProps) {
  const config = LIMIT_CONFIG[type]
  const Icon = config.icon

  /**
   * Handle item removal.
   */
  const handleRemove = useCallback(
    (item: LimitPromptItem) => {
      onRemoveItem(item)
    },
    [onRemoveItem]
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={cn(
          'fixed inset-x-4 top-1/2 -translate-y-1/2 z-50',
          'md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-md md:w-full',
          'bg-background-card rounded-card shadow-card',
          'animate-fade-in'
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="limit-prompt-title"
        aria-describedby="limit-prompt-description"
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-5 pb-0">
          {/* Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-full shrink-0',
              'flex items-center justify-center',
              config.iconBg
            )}
          >
            <Icon size={20} className={config.iconColor} />
          </div>

          {/* Title and description */}
          <div className="flex-1 min-w-0">
            <h2
              id="limit-prompt-title"
              className="text-title text-foreground mb-1"
            >
              {config.title}
            </h2>
            <p
              id="limit-prompt-description"
              className="text-caption text-foreground-muted"
            >
              {newItemName
                ? `${config.description} "${newItemName}".`
                : config.description}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded-full hover:bg-gray-20 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-foreground-muted" />
          </button>
        </div>

        {/* Items list */}
        <div className="p-5 pt-4 max-h-[40vh] overflow-y-auto">
          <p className="text-caption text-foreground-muted mb-3">
            Select an item to remove:
          </p>

          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3',
                    'p-3 rounded-card',
                    'bg-gray-10 hover:bg-gray-20',
                    'transition-colors duration-150',
                    'text-left'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-body text-foreground truncate">
                      {item.name}
                    </p>
                    {item.kcal !== undefined && (
                      <p className="text-caption text-foreground-muted">
                        {item.kcal} kcal
                      </p>
                    )}
                  </div>
                  <span className="text-caption text-secondary shrink-0">
                    {config.actionLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'w-full h-11 rounded-pill',
              'bg-gray-20 text-foreground',
              'text-body font-medium',
              'hover:bg-gray-30',
              'transition-colors duration-150'
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
