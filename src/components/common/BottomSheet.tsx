/**
 * BottomSheet - Responsive modal/drawer component using Radix Dialog.
 * 
 * Provides consistent bottom-anchored drawer behavior on mobile (<768px)
 * and centered modal on desktop (>=768px). Handles focus trap, escape key,
 * backdrop click, and body scroll lock automatically via Radix primitives.
 * 
 * Used by: PortionPicker, TemplateEditorSheet, TemplateConfirmSheet
 */

import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  /** Controls visibility of the sheet */
  isOpen: boolean
  /** Callback when sheet should close (backdrop click, escape, etc.) */
  onClose: () => void
  /** Optional title for accessibility and header display (string or ReactNode) */
  title?: React.ReactNode
  /** Optional description for screen readers */
  description?: string
  /** Sheet content */
  children: React.ReactNode
  /** Size variant: auto (content-based), half (50% height), full (100% height) */
  size?: 'auto' | 'half' | 'full'
  /** Show drag handle indicator at top (mobile only) */
  showDragHandle?: boolean
}

/**
 * Responsive bottom sheet component.
 * Mobile: Bottom-anchored drawer with slide-up animation
 * Desktop: Centered modal with backdrop
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'auto',
  showDragHandle = true,
}: BottomSheetProps) {
  // BottomSheet itself no longer mutates global scroll/overflow state.
  // Radix's dialog overlay handles focus trapping and scroll blocking,
  // which keeps the main UI stable while the sheet is open.
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop overlay - Radix handles click-to-close */}
        <Dialog.Overlay
          className={cn(
            // Fixed overlay covering entire viewport
            'fixed inset-0 z-50 bg-black/40',
            // Fade-in animation (Radix handles state transitions)
            'data-[state=open]:animate-fade-in'
          )}
        />

        {/* Sheet content container */}
        <Dialog.Content
          className={cn(
            // Base positioning: fixed, z-index above overlay
            'fixed z-50',
            // Mobile app-style: flush with bottom edge so the main UI behind does not appear lifted.
            // We still centre horizontally and cap width on larger screens.
            'bottom-0 left-0 right-0 mx-auto w-full max-w-lg',
            // Desktop: same bottom alignment to avoid extra gap under full-screen sheets.
            'md:bottom-0',
            // Background and styling - rounded top corners, square bottom for edge-to-edge feel
            'bg-background-card rounded-t-2xl rounded-b-none',
            'shadow-xl',
            // Padding: top and sides only, bottom padding kept minimal to avoid visible extra space
            'px-5 pt-6 pb-4',
            // Size variants
            size === 'half' && 'h-1/2',
            size === 'full' && 'h-full md:h-auto md:max-h-[90vh]',
            size === 'auto' && 'max-h-[90vh]',
            // Animation: slide-up with fade
            'data-[state=open]:animate-slide-up',
            // Focus management: Radix handles focus trap automatically
            'outline-none focus:outline-none'
          )}
          // Radix Dialog automatically handles backdrop click to close,
          // and the escape key is wired via onOpenChange above.
        >
          {/* Drag handle indicator - optional visual affordance */}
          {showDragHandle && (
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
          )}

          {/* Optional title - used for accessibility and visual header */}
          {title && (
            <Dialog.Title className="text-title text-foreground text-center mb-6">
              {title}
            </Dialog.Title>
          )}

          {/* Optional description for screen readers */}
          {description && (
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
          )}

          {/* Sheet content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
