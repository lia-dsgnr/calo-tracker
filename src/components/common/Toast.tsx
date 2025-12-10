/**
 * Toast - Success notification with optional undo action.
 * Auto-hides after 2 seconds per spec.
 * Shows food name and provides undo capability for the last logged entry.
 */

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastState } from '@/types'

interface ToastProps {
  toast: ToastState
  onClose: () => void
  onUndo?: () => void
}

// Auto-hide delay in milliseconds
const AUTO_HIDE_DELAY = 2000

export function Toast({ toast, onClose, onUndo }: ToastProps) {
  // Auto-hide timer
  useEffect(() => {
    if (!toast.visible) return

    const timer = setTimeout(() => {
      onClose()
    }, AUTO_HIDE_DELAY)

    return () => clearTimeout(timer)
  }, [toast.visible, onClose])

  const handleUndoClick = useCallback(() => {
    if (onUndo) {
      onUndo()
    }
    onClose()
  }, [onUndo, onClose])

  if (!toast.visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Fixed position at bottom of screen, above safe area
        'fixed bottom-6 left-4 right-4 z-40',
        'mx-auto max-w-md',
        // Card styling: rounded, shadowed
        'bg-foreground text-background rounded-card shadow-card',
        'px-4 py-3',
        'flex items-center justify-between gap-3',
        // Entry animation
        'animate-slide-up'
      )}
    >
      {/* Message content */}
      <p className="text-body flex-1 truncate">
        {toast.message}
      </p>

      {/* Action buttons container */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Undo button - only shown when undo action is available */}
        {toast.undoAction && onUndo && (
          <button
            type="button"
            onClick={handleUndoClick}
            className={cn(
              'text-secondary font-medium text-body',
              'px-2 py-1 -my-1',
              'rounded hover:bg-white/10 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-secondary',
              'tap-highlight-none'
            )}
          >
            Undo
          </button>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className={cn(
            'p-1 -m-1 rounded-full',
            'hover:bg-white/10 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-secondary',
            'tap-highlight-none'
          )}
        >
          <X className="w-5 h-5 opacity-70" />
        </button>
      </div>
    </div>
  )
}
