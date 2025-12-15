/**
 * RecentSection - Enhanced recent items display with source indicators.
 * Shows recently logged foods with badges for database/custom/manual source.
 * Handles deleted custom foods with snapshot values.
 */

import { useMemo } from 'react'
import { Heart, Database, User, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodType } from '@/db/types'

// Recent item with source information
export interface RecentDisplayItem {
  id: string
  foodId: string
  foodType: FoodType
  name: string
  kcal: number
  protein: number
  portion: string
  loggedAt: number
  /** True if the source custom food was deleted */
  isDeleted?: boolean
  /** True if this food is in favorites */
  isFavorited?: boolean
}

interface RecentSectionProps {
  items: RecentDisplayItem[]
  onSelect: (item: RecentDisplayItem) => void
  onFavoriteToggle?: (item: RecentDisplayItem) => void
  isLoading?: boolean
}

export function RecentSection({
  items,
  onSelect,
  onFavoriteToggle,
  isLoading = false,
}: RecentSectionProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-foreground-muted">
          Loading recent foods...
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-20 flex items-center justify-center mb-4">
          <Clock size={24} className="text-foreground-muted" />
        </div>
        <p className="text-body text-foreground mb-2">No recent foods</p>
        <p className="text-caption text-foreground-muted">
          Start logging to see your recent meals here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Items list */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <RecentItemCard
              item={item}
              onSelect={onSelect}
              onFavoriteToggle={onFavoriteToggle}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Recent item card with source indicator.
 */
function RecentItemCard({
  item,
  onSelect,
  onFavoriteToggle,
}: {
  item: RecentDisplayItem
  onSelect: (item: RecentDisplayItem) => void
  onFavoriteToggle?: (item: RecentDisplayItem) => void
}) {
  // Format relative time
  const relativeTime = useMemo(() => {
    return formatRelativeTime(item.loggedAt)
  }, [item.loggedAt])

  const handleClick = () => {
    onSelect(item)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavoriteToggle?.(item)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 p-4',
        'bg-background-card rounded-card shadow-tile',
        'text-left',
        'hover:shadow-card',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'transition-all duration-150',
        item.isDeleted && 'opacity-75'
      )}
    >
      {/* Food info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Food name */}
          <p className="text-body font-medium text-foreground truncate">
            {item.name}
          </p>

          {/* Source badge */}
          <SourceBadge foodType={item.foodType} isDeleted={item.isDeleted} />
        </div>

        {/* Nutrition and time info */}
        <p className="text-caption text-foreground-muted">
          {item.kcal} kcal • {item.portion} • {relativeTime}
        </p>
      </div>

      {/* Favorite heart (if toggle provided and not deleted) */}
      {onFavoriteToggle && !item.isDeleted && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={cn(
            'p-2 rounded-full shrink-0',
            'hover:bg-gray-20',
            'transition-colors duration-150'
          )}
          aria-label={
            item.isFavorited
              ? `Remove ${item.name} from favorites`
              : `Add ${item.name} to favorites`
          }
        >
          <Heart
            size={18}
            className={cn(
              item.isFavorited
                ? 'fill-secondary text-secondary'
                : 'text-foreground-muted'
            )}
          />
        </button>
      )}
    </button>
  )
}

/**
 * Source badge component.
 */
function SourceBadge({
  foodType,
  isDeleted,
}: {
  foodType: FoodType
  isDeleted?: boolean
}) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-orange-20 text-orange-70 text-xs">
        <AlertCircle size={10} />
        <span>Deleted</span>
      </span>
    )
  }

  if (foodType === 'system') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-green-20 text-green-70 text-xs">
        <Database size={10} />
        <span>Database</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-purple-20 text-purple-70 text-xs">
      <User size={10} />
      <span>Custom</span>
    </span>
  )
}

/**
 * Format timestamp to relative time string.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return 'Just now'
  }

  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  // For older items, show date
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}
