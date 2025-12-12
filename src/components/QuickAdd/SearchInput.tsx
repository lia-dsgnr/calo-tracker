/**
 * SearchInput - Search input field for food search.
 * Features debounced input, clear button, and loading state.
 * Follows visual guidelines: rounded, soft border, warm styling.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeQuery, SEARCH_CONSTANTS } from '@/lib/search'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onClear: () => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
}

const DEBOUNCE_MS = 200

export function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
  onSubmit,
  isLoading = false,
  placeholder = 'Search food...',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Handle input change with sanitization and debouncing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      const sanitized = sanitizeQuery(raw)
      setLocalValue(sanitized)

      // Clear previous debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Debounce the onChange callback
      debounceRef.current = setTimeout(() => {
        onChange(sanitized)
      }, DEBOUNCE_MS)
    },
    [onChange]
  )

  // Handle clear button click
  const handleClear = useCallback(() => {
    setLocalValue('')
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    onClear()
    inputRef.current?.focus()
  }, [onClear])

  // Handle Enter key to save recent search
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
        onChange(localValue)
        onSubmit()
      }
    },
    [localValue, onChange, onSubmit]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const showClear = localValue.length > 0
  const showLoading = isLoading && localValue.length >= SEARCH_CONSTANTS.MIN_QUERY_LENGTH

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search
          className="w-5 h-5 text-foreground-muted"
          strokeWidth={1.5}
        />
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={SEARCH_CONSTANTS.MAX_QUERY_LENGTH}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn(
          // Layout
          'w-full h-12 pl-12 pr-12',
          // Typography
          'text-body text-foreground placeholder:text-foreground-muted',
          // Background & border (visual guidelines: soft border, rounded input)
          'bg-white border border-gray-30',
          'rounded-input',
          // Focus state (green ring per design system)
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          // Transitions
          'transition-all duration-150',
          // Touch target already met (h-12 = 48px > 44px min)
          'tap-highlight-none'
        )}
      />

      {/* Right side: loading spinner or clear button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showLoading && (
          <Loader2
            className="w-5 h-5 text-foreground-muted animate-spin"
            strokeWidth={1.5}
          />
        )}

        {showClear && !showLoading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              'p-1.5 rounded-full',
              'text-foreground-muted hover:text-foreground',
              'hover:bg-gray-10 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'tap-highlight-none'
            )}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}
