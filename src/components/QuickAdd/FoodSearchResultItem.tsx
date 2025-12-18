/**
 * FoodSearchResultItem - Individual food result row for search.
 * Uses ListItem with match highlighting, source label, favourite heart, and log count badge.
 * Heart button lets users quickly add/remove foods from favourites directly from search.
 */

import { useMemo, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { ListItem, Badge, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import { getFoodEmoji } from '@/lib/food-emoji'
import type { FoodItem } from '@/types'
import type { SearchResultItem } from '@/hooks/useFoodSearch'

interface FoodSearchResultItemProps {
  /** Search result item with food and metadata */
  item: SearchResultItem
  /** Current search query for highlighting */
  query: string
  /** Callback when item is selected */
  onSelect: (food: FoodItem) => void
  /** Toggle favourite status for this food */
  onToggleFavorite: (food: FoodItem) => void
}

/**
 * Highlight matching text in a string.
 * Wraps matched portions in a styled span.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <span className="bg-yellow-20 text-foreground rounded-sm px-0.5">
        {match}
      </span>
      {after}
    </>
  )
}

/**
 * Get subtitle text based on source type.
 */
function getSubtitle(item: SearchResultItem): string {
  switch (item.source) {
    case 'favourite':
      return 'Your food'
    case 'recent':
      if (item.daysSinceLogged === 0) {
        return 'Your food'
      } else if (item.daysSinceLogged === 1) {
        return 'Your food · Logged yesterday'
      } else if (item.daysSinceLogged !== undefined) {
        return `Your food · Logged ${item.daysSinceLogged} days ago`
      }
      return 'Your food'
    case 'database':
      return 'Global database'
  }
}

/**
 * Food search result item with emoji, highlighted name, and metadata.
 */
export function FoodSearchResultItem({
  item,
  query,
  onSelect,
  onToggleFavorite,
}: FoodSearchResultItemProps) {
  const { food, source, logCount, isFavorite } = item

  // Get emoji for thumbnail from the shared food-emoji source of truth.
  const emoji = getFoodEmoji(food)

  // Build highlighted title
  const highlightedTitle = useMemo(
    () => highlightMatch(food.name_vi, query),
    [food.name_vi, query]
  )

  // Build subtitle based on source
  const subtitle = getSubtitle(item)

  // Handle selection (tapping the row opens portion picker)
  const handleClick = useCallback(() => {
    onSelect(food)
  }, [food, onSelect])

  // Handle favourite toggle from heart button without triggering row click
  const handleToggleFavorite = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onToggleFavorite(food)
    },
    [food, onToggleFavorite]
  )

  // Build right slot: heart button + optional log count badge
  const rightSlot = useMemo(() => {
    const heart = (
      <IconButton
        icon={
          <Heart
            size={18}
            className={cn(
              'transition-colors duration-150',
              isFavorite ? 'text-orange-60 fill-current' : 'text-foreground-muted'
            )}
          />
        }
        onClick={handleToggleFavorite}
        aria-label={isFavorite ? `Remove ${food.name_vi} from favourites` : `Add ${food.name_vi} to favourites`}
        variant="ghost"
        size="sm"
      />
    )

    if (source === 'recent' && logCount && logCount > 1) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="muted">Logged {logCount}x</Badge>
          {heart}
        </div>
      )
    }

    return heart
  }, [food.name_vi, handleToggleFavorite, isFavorite, logCount, source])

  return (
    <ListItem
      leftSlot={
        <div
          className={cn(
            'w-12 h-12 shrink-0',
            'flex items-center justify-center',
            'bg-brown-10 rounded-xl',
            'text-2xl'
          )}
        >
          {emoji}
        </div>
      }
      title={highlightedTitle}
      subtitle={subtitle}
      rightSlot={rightSlot}
      onClick={handleClick}
    />
  )
}
