/**
 * SearchResults - Displays filtered food search results.
 * Shows food items with source badges (database vs custom) and favorite heart icons.
 * Handles empty state with Manual Entry prompt.
 */

import { useCallback } from 'react'
import { Heart, Database, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoodType } from '@/db/types'

// Unified search result type for display
export interface SearchResult {
  id: string
  name: string // name_vi for system, name for custom
  nameEn?: string // Only for system foods
  kcal: number // M portion for system, fixed for custom
  protein: number
  foodType: FoodType
  isFavorited: boolean
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isLoading?: boolean
  onSelect: (result: SearchResult) => void
  onFavoriteToggle: (result: SearchResult) => void
  onManualEntryClick: () => void
}

export function SearchResults({
  results,
  query,
  isLoading = false,
  onSelect,
  onFavoriteToggle,
  onManualEntryClick,
}: SearchResultsProps) {
  /**
   * Handle result item click.
   */
  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelect(result)
    },
    [onSelect]
  )

  /**
   * Handle favorite toggle with event stop propagation.
   */
  const handleFavoriteClick = useCallback(
    (event: React.MouseEvent, result: SearchResult) => {
      event.stopPropagation()
      onFavoriteToggle(result)
    },
    [onFavoriteToggle]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex items-center gap-2 text-foreground-muted">
          <Search size={20} className="animate-bounce" />
          <span className="text-body">Searching...</span>
        </div>
      </div>
    )
  }

  // Empty state - no results found
  if (results.length === 0 && query.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-20 flex items-center justify-center mb-4">
          <Search size={24} className="text-foreground-muted" />
        </div>
        <p className="text-body text-foreground mb-2">No foods found</p>
        <p className="text-caption text-foreground-muted mb-4">
          Try a different search term or add it manually
        </p>
        <button
          type="button"
          onClick={onManualEntryClick}
          className={cn(
            'px-4 py-2 rounded-pill',
            'bg-primary text-primary-foreground',
            'text-body font-medium',
            'hover:bg-primary-dark',
            'transition-colors duration-150'
          )}
        >
          Can't find your food?
        </button>
      </div>
    )
  }

  // Results list
  return (
    <div className="space-y-2">
      {/* Results count */}
      <p className="text-caption text-foreground-muted px-1">
        {results.length} result{results.length !== 1 ? 's' : ''}
      </p>

      {/* Results list */}
      <ul className="space-y-2" role="listbox" aria-label="Search results">
        {results.map((result) => (
          <li key={`${result.foodType}-${result.id}`}>
            <button
              type="button"
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full flex items-center gap-3 p-4',
                'bg-background-card rounded-card shadow-tile',
                'text-left',
                'hover:shadow-card',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'transition-all duration-150'
              )}
              role="option"
            >
              {/* Food info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Food name */}
                  <p className="text-body font-medium text-foreground truncate">
                    {result.name}
                  </p>

                  {/* Source badge */}
                  <SourceBadge foodType={result.foodType} />
                </div>

                {/* English name for system foods */}
                {result.nameEn && (
                  <p className="text-caption text-foreground-muted truncate mb-1">
                    {result.nameEn}
                  </p>
                )}

                {/* Nutrition info */}
                <p className="text-caption text-foreground-muted">
                  {result.kcal} kcal • {result.protein}g protein
                </p>
              </div>

              {/* Favorite heart button */}
              <button
                type="button"
                onClick={(e) => handleFavoriteClick(e, result)}
                className={cn(
                  'p-2 rounded-full shrink-0',
                  'flex items-center justify-center',
                  'hover:bg-gray-20',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
                )}
                aria-label={
                  result.isFavorited
                    ? `Remove ${result.name} from favorites`
                    : `Add ${result.name} to favorites`
                }
              >
                <Heart
                  size={20}
                  className={cn(
                    result.isFavorited
                      ? 'fill-secondary text-secondary'
                      : 'text-foreground-muted'
                  )}
                />
              </button>
            </button>
          </li>
        ))}
      </ul>

      {/* Manual entry link at bottom */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={onManualEntryClick}
          className="text-caption text-primary hover:underline"
        >
          Can't find your food? Add it manually
        </button>
      </div>
    </div>
  )
}

/**
 * Source badge component to indicate food type.
 */
function SourceBadge({ foodType }: { foodType: FoodType }) {
  const isSystem = foodType === 'system'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-chip',
        'text-xs',
        isSystem ? 'bg-green-20 text-green-70' : 'bg-purple-20 text-purple-70'
      )}
    >
      {isSystem ? (
        <>
          <Database size={10} />
          <span>Database</span>
        </>
      ) : (
        <>
          <User size={10} />
          <span>Custom</span>
        </>
      )}
    </span>
  )
}
