/**
 * SearchResults - Displays search results, recent searches, and empty states.
 * Handles result highlighting and selection.
 * Follows visual guidelines: warm styling, soft interactions.
 */

import { useCallback } from 'react'
import { Clock, X, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { highlightMatches, SEARCH_CONSTANTS, type SearchResult } from '@/lib/search'
import type { FoodItem } from '@/types'
import type { RecentSearch } from '@/db/types'

interface SearchResultsProps {
  // Search state
  query: string
  results: SearchResult[]
  isLoading: boolean
  // Recent searches
  recentSearches: RecentSearch[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (id: number) => void
  onClearRecentSearches: () => void
  // Result selection
  onSelectFood: (food: FoodItem) => void
  // Clear input action
  onClearInput: () => void
}

export function SearchResults({
  query,
  results,
  isLoading,
  recentSearches,
  onSelectRecentSearch,
  onDeleteRecentSearch,
  onClearRecentSearches,
  onSelectFood,
  onClearInput,
}: SearchResultsProps) {
  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH
  const hasResults = results.length > 0
  const hasRecentSearches = recentSearches.length > 0

  // Show loading state
  if (isLoading && hasQuery) {
    return <LoadingState />
  }

  // Show search results when query has results
  if (hasQuery && hasResults) {
    return (
      <ResultsList
        results={results}
        query={trimmedQuery}
        onSelectFood={onSelectFood}
      />
    )
  }

  // Show no results + recent searches when query has no matches
  if (hasQuery && !hasResults) {
    return (
      <NoResultsState
        query={trimmedQuery}
        recentSearches={recentSearches}
        onSelectRecentSearch={onSelectRecentSearch}
        onDeleteRecentSearch={onDeleteRecentSearch}
        onClearInput={onClearInput}
      />
    )
  }

  // Show recent searches when input is focused but empty/short query
  if (hasRecentSearches) {
    return (
      <RecentSearchesList
        recentSearches={recentSearches}
        onSelectRecentSearch={onSelectRecentSearch}
        onDeleteRecentSearch={onDeleteRecentSearch}
        onClearAll={onClearRecentSearches}
      />
    )
  }

  // Nothing to show
  return null
}

/**
 * Loading state with skeleton items
 */
function LoadingState() {
  return (
    <div className="py-4 space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 animate-pulse"
        >
          <div className="h-5 w-32 bg-gray-20 rounded" />
          <div className="h-4 w-16 bg-gray-20 rounded ml-auto" />
        </div>
      ))}
      <p className="text-caption text-foreground-muted text-center pt-2">
        Searching...
      </p>
    </div>
  )
}

/**
 * Search results list with highlighted matches
 */
function ResultsList({
  results,
  query,
  onSelectFood,
}: {
  results: SearchResult[]
  query: string
  onSelectFood: (food: FoodItem) => void
}) {
  return (
    <ul className="py-2" role="listbox">
      {results.map(({ food, matchedField }) => (
        <ResultItem
          key={food.id}
          food={food}
          query={query}
          matchedField={matchedField}
          onSelect={() => onSelectFood(food)}
        />
      ))}
    </ul>
  )
}

/**
 * Individual search result item with highlight
 */
function ResultItem({
  food,
  query,
  matchedField,
  onSelect,
}: {
  food: FoodItem
  query: string
  matchedField: 'vi' | 'en' | 'fuzzy'
  onSelect: () => void
}) {
  // Highlight the field that matched
  const viSegments = highlightMatches(food.name_vi, query)
  const enSegments = matchedField === 'en' ? highlightMatches(food.name_en, query) : null
  const kcal = food.portions.M.kcal

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'w-full flex items-center justify-between gap-3',
          'px-4 py-3 text-left',
          'hover:bg-gray-10 active:bg-gray-20',
          'transition-colors duration-150',
          'focus:outline-none focus:bg-gray-10',
          'tap-highlight-none'
        )}
        role="option"
      >
        {/* Food name with highlighted match */}
        <div className="flex-1 min-w-0">
          <span className="text-body text-foreground truncate block">
            {viSegments.map((segment, i) =>
              segment.highlighted ? (
                <span key={i} className="font-extrabold text-orange-40">
                  {segment.text}
                </span>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            )}
          </span>
          {/* Show English name when it matched on English */}
          {enSegments && (
            <span className="text-caption text-foreground-muted truncate block">
              {enSegments.map((segment, i) =>
                segment.highlighted ? (
                  <span key={i} className="font-extrabold text-orange-40">
                    {segment.text}
                  </span>
                ) : (
                  <span key={i}>{segment.text}</span>
                )
              )}
            </span>
          )}
        </div>

        {/* Calories */}
        <span className="text-caption text-foreground-muted whitespace-nowrap">
          {kcal} kcal
        </span>
      </button>
    </li>
  )
}

/**
 * No results state with recent searches fallback
 */
function NoResultsState({
  query,
  recentSearches,
  onSelectRecentSearch,
  onDeleteRecentSearch,
  onClearInput,
}: {
  query: string
  recentSearches: RecentSearch[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (id: number) => void
  onClearInput: () => void
}) {
  const hasRecentSearches = recentSearches.length > 0

  return (
    <div className="py-6">
      {/* No results message */}
      <div className="flex flex-col items-center gap-3 px-4 pb-6">
        <SearchX
          className="w-10 h-10 text-foreground-muted opacity-50"
          strokeWidth={1.5}
        />
        <p className="text-body text-foreground-muted text-center">
          No foods found for "{query}"
        </p>
        <button
          type="button"
          onClick={onClearInput}
          className={cn(
            'text-caption text-primary font-medium',
            'hover:underline focus:outline-none focus:underline',
            'tap-highlight-none'
          )}
        >
          Clear search
        </button>
      </div>

      {/* Recent searches below */}
      {hasRecentSearches && (
        <div className="border-t border-border pt-4">
          <RecentSearchesList
            recentSearches={recentSearches}
            onSelectRecentSearch={onSelectRecentSearch}
            onDeleteRecentSearch={onDeleteRecentSearch}
            showClearAll={false}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Recent searches list
 */
function RecentSearchesList({
  recentSearches,
  onSelectRecentSearch,
  onDeleteRecentSearch,
  onClearAll,
  showClearAll = true,
}: {
  recentSearches: RecentSearch[]
  onSelectRecentSearch: (term: string) => void
  onDeleteRecentSearch: (id: number) => void
  onClearAll?: () => void
  showClearAll?: boolean
}) {
  const handleDelete = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      onDeleteRecentSearch(id)
    },
    [onDeleteRecentSearch]
  )

  return (
    <div className="py-2">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <h3 className="text-caption font-semibold uppercase tracking-wide text-foreground-muted">
          Recent Searches
        </h3>
        {showClearAll && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              'text-caption text-foreground-muted',
              'hover:text-foreground focus:outline-none',
              'tap-highlight-none'
            )}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Recent search items */}
      <ul>
        {recentSearches.map((search) => (
          <li key={search.id}>
            <button
              type="button"
              onClick={() => onSelectRecentSearch(search.searchTerm)}
              className={cn(
                'w-full flex items-center gap-3',
                'px-4 py-3 text-left',
                'hover:bg-gray-10 active:bg-gray-20',
                'transition-colors duration-150',
                'focus:outline-none focus:bg-gray-10',
                'tap-highlight-none'
              )}
            >
              <Clock
                className="w-4 h-4 text-foreground-muted shrink-0"
                strokeWidth={1.5}
              />
              <span className="text-body text-foreground flex-1 truncate">
                {search.searchTerm}
              </span>
              <button
                type="button"
                onClick={(e) => handleDelete(e, search.id)}
                aria-label={`Remove "${search.searchTerm}" from recent searches`}
                className={cn(
                  'p-1.5 rounded-full shrink-0',
                  'text-foreground-muted hover:text-foreground',
                  'hover:bg-gray-20 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'tap-highlight-none'
                )}
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
