/**
 * TimelineCard - Simplified card for a logged meal entry.
 * Shows emoji, food name, time, calories, and re-log action.
 * No expand/collapse - streamlined for quick recall and re-logging.
 */

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { Card, IconButton } from '@/components/common'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { getSystemFoodById } from '@/db'
import {
  getCategoryEmoji,
  getCachedCategory,
  cacheFoodCategory,
} from '@/lib/food-emoji'
import type { LogEntry } from '@/types'

interface TimelineCardProps {
  log: LogEntry
  onLogAgain: (log: LogEntry) => void
}

/**
 * Timeline card with emoji, meal info, and re-log button.
 * Fetches category from database to display appropriate emoji.
 */
export function TimelineCard({ log, onLogAgain }: TimelineCardProps) {
  const [emoji, setEmoji] = useState<string>('🍽️')

  // Fetch category emoji on mount (with caching)
  useEffect(() => {
    const cachedCategory = getCachedCategory(log.foodId)
    if (cachedCategory) {
      setEmoji(getCategoryEmoji(cachedCategory))
      return
    }

    // Lookup from database if not cached
    getSystemFoodById(log.foodId).then((food) => {
      if (food) {
        cacheFoodCategory(log.foodId, food.category)
        setEmoji(getCategoryEmoji(food.category))
      }
    })
  }, [log.foodId])

  // Handle re-log action
  const handleLogAgain = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onLogAgain(log)
    },
    [log, onLogAgain]
  )

  // Format timestamp to time (e.g., "10:30 AM")
  const timeLabel = format(new Date(log.timestamp), 'h:mm a')

  return (
    <Card variant="default" className={cn('flex items-center gap-3')}>
      {/* Left: Emoji in subtle container */}
      <div
        className={cn(
          'w-10 h-10 shrink-0',
          'flex items-center justify-center',
          'bg-brown-10 rounded-xl',
          'text-xl'
        )}
        aria-hidden="true"
      >
        {emoji}
      </div>

      {/* Centre: Meal name and time/calories */}
      <div className="flex-1 min-w-0">
        <p className="text-body text-foreground font-medium truncate">
          {log.name_vi}
        </p>
        <p className="text-caption text-foreground-muted">
          {timeLabel} • {log.kcal} cal
        </p>
      </div>

      {/* Right: Re-log button */}
      <IconButton
        icon={<RotateCcw size={20} />}
        onClick={handleLogAgain}
        aria-label={`Log ${log.name_vi} again`}
        variant="default"
        size="md"
      />
    </Card>
  )
}
