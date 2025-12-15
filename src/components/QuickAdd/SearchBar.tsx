/**
 * SearchBar - Search input with recent search chips.
 * Displays search input field with clear button and recent search chips below.
 * Used on QuickAddPage for food search functionality.
 */

import { useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecentSearch } from '@/db/types'

// Maximum query length per FR-001.1
const MAX_QUERY_LENGTH = 50

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  recentSearches: RecentSearch[]
  onRecentClick: (term: string) => void
  onClearRecent?: (id: number) => void
  onClearAllRecent?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  recentSearches,
  onRecentClick,
  onClearRecent,
  onClearAllRecent,
  placeholder = 'Search foods...',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  /**
   * Handle input change with length truncation (FR-001.1).
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.slice(0, MAX_QUERY_LENGTH)
      onChange(newValue)
    },
    [onChange]
  )

  /**
   * Clear search input.
   */
  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  /**
   * Handle recent search chip click.
   */
  const handleRecentClick = useCallback(
    (term: string) => {
      onChange(term)
      onRecentClick(term)
    },
    [onChange, onRecentClick]
  )

  // Show recent searches when input is empty and focused
  const showRecentSearches = value.length === 0 && recentSearches.length > 0

  return (
    <div className="space-y-3">
      {/* Search input field */}
      <div className="relative">
        {/* Search icon */}
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
          aria-hidden="true"
        />

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full h-12 pl-11 pr-10',
            'bg-background-card rounded-input',
            'text-body text-foreground placeholder:text-foreground-muted',
            'border border-border',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all duration-150'
          )}
          aria-label="Search foods"
        />

        {/* Clear button - only visible when there is text */}
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'p-1 rounded-full',
              'text-foreground-muted hover:text-foreground',
              'hover:bg-gray-20',
              'transition-colors duration-150'
            )}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Recent searches chips */}
      {showRecentSearches && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-caption text-foreground-muted">
              Recent searches
            </span>
            {onClearAllRecent && (
              <button
                type="button"
                onClick={onClearAllRecent}
                className="text-caption text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Chips row */}
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className={cn(
                  'inline-flex items-center gap-1',
                  'px-3 py-1.5 rounded-chip',
                  'bg-gray-20 text-foreground',
                  'text-caption'
                )}
              >
                <button
                  type="button"
                  onClick={() => handleRecentClick(search.searchTerm)}
                  className="hover:underline"
                >
                  {search.searchTerm}
                </button>

                {onClearRecent && (
                  <button
                    type="button"
                    onClick={() => onClearRecent(search.id)}
                    className="p-0.5 rounded-full hover:bg-gray-30 transition-colors"
                    aria-label={`Remove ${search.searchTerm} from recent searches`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
