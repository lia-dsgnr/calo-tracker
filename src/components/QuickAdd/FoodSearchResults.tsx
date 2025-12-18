/**
 * FoodSearchResults - Grouped search results display.
 * Shows results in order: Favourites → Recently Logged → All Foods.
 * Each group is collapsible after 5 items.
 * Handles empty states and first-time user experience.
 */

import { useState, useCallback } from 'react'
import { Star, Clock, ArrowUpDown, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { SectionHeader } from '@/components/common'
import { FoodSearchResultItem } from './FoodSearchResultItem'
import { cn } from '@/lib/utils'
import type { SearchResults, SearchResultItem } from '@/hooks/useFoodSearch'
import type { FoodItem } from '@/types'

// Number of items to show before collapsing
const COLLAPSE_THRESHOLD = 5

interface FoodSearchResultsProps {
  /** Grouped search results */
  results: SearchResults
  /** Current search query for highlighting */
  query: string
  /** Callback when a food item is selected */
  onSelectFood: (food: FoodItem) => void
  /** Whether search is in progress */
  isSearching: boolean
  /** Toggle favourite status for a given food */
  onToggleFavorite: (food: FoodItem) => void
}

/**
 * Empty state when search returns no results.
 * Shows emoji, message, and CTA to add custom food (mocked for now).
 */
function NoResultsState({ query }: { query: string }) {
  // Handle add custom food (mocked - will be implemented later)
  const handleAddCustomFood = useCallback(() => {
    // TODO: Implement custom food creation flow
    console.log('Add custom food:', query)
  }, [query])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Emoji indicator */}
      <span className="text-5xl mb-4" role="img" aria-label="No results">
        😐
      </span>

      {/* Message */}
      <h3 className="text-title text-foreground mb-2">No results yet</h3>
      <p className="text-body text-foreground-muted text-center mb-6">
        Add as a custom food?
      </p>

      {/* CTA button (mocked) */}
      <button
        type="button"
        onClick={handleAddCustomFood}
        className={cn(
          'flex items-center gap-2',
          'px-6 py-3',
          'bg-background-card border border-gray-20',
          'rounded-card shadow-card',
          'text-body text-primary font-medium',
          'hover:bg-gray-10 active:bg-gray-20',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <Plus size={18} />
        Add custom food
      </button>
    </div>
  )
}

/**
 * First-time user state when no search history exists.
 * Shows helper text encouraging exploration.
 */
function FirstTimeState() {
  return (
    <div className="py-4 px-2">
      <p className="text-body text-foreground-muted text-center">
        You'll see your frequently logged foods here over time.
      </p>
    </div>
  )
}

interface CollapsibleSectionProps {
  /** Section header icon */
  icon: React.ReactNode
  /** Section header label */
  label: string
  /** Items to display */
  items: SearchResultItem[]
  /** Current search query for highlighting */
  query: string
  /** Callback when a food item is selected */
  onSelectFood: (food: FoodItem) => void
  /** Toggle favourite status for a given food */
  onToggleFavorite: (food: FoodItem) => void
}

/**
 * Collapsible section for a group of search results.
 * Shows first 5 items by default, with "Show more" toggle.
 */
function CollapsibleSection({
  icon,
  label,
  items,
  query,
  onSelectFood,
  onToggleFavorite,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const needsCollapse = items.length > COLLAPSE_THRESHOLD
  const displayedItems = needsCollapse && !isExpanded
    ? items.slice(0, COLLAPSE_THRESHOLD)
    : items

  const hiddenCount = items.length - COLLAPSE_THRESHOLD

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mb-6">
      <SectionHeader icon={icon} label={label} />

      <div className="space-y-2">
        {displayedItems.map((item) => (
          <FoodSearchResultItem
            key={item.food.id}
            item={item}
            query={query}
            onSelect={onSelectFood}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Show more/less toggle */}
      {needsCollapse && (
        <button
          type="button"
          onClick={toggleExpanded}
          className={cn(
            'flex items-center gap-1 w-full justify-center',
            'py-2 mt-1',
            'text-caption text-foreground-muted',
            'hover:text-foreground',
            'transition-colors duration-150',
            'focus:outline-none focus:underline'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show {hiddenCount} more
            </>
          )}
        </button>
      )}
    </section>
  )
}

/**
 * Food search results with grouped sections.
 * Displays favourites, recently logged, and all foods in priority order.
 * Handles empty states and first-time user experience.
 */
export function FoodSearchResults({
  results,
  query,
  onSelectFood,
  isSearching,
  onToggleFavorite,
}: FoodSearchResultsProps) {
  const { favourites, recentlyLogged, allFoods, hasResults, hasHistory } = results

  // Loading state
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-body text-foreground-muted">Searching...</div>
      </div>
    )
  }

  // No results state: user searched but nothing matched
  if (query.trim() && !hasResults) {
    return <NoResultsState query={query} />
  }

  // First-time state: no query and no history, but show all foods A-Z
  const showFirstTimeHelper = !query.trim() && !hasHistory

  return (
    <div className="mt-4">
      {/* First-time helper text */}
      {showFirstTimeHelper && <FirstTimeState />}

      {/* Favourites section */}
      <CollapsibleSection
        icon={<Star size={18} />}
        label="Favourite Foods"
        items={favourites}
        query={query}
        onSelectFood={onSelectFood}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Recently Logged section */}
      <CollapsibleSection
        icon={<Clock size={18} />}
        label="Recently Logged"
        items={recentlyLogged}
        query={query}
        onSelectFood={onSelectFood}
        onToggleFavorite={onToggleFavorite}
      />

      {/* All Foods section */}
      <CollapsibleSection
        icon={<ArrowUpDown size={18} />}
        label="All Foods"
        items={allFoods}
        query={query}
        onSelectFood={onSelectFood}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  )
}
