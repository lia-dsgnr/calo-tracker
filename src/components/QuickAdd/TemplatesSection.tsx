/**
 * TemplatesSection - Section displaying user's meal templates.
 * Shows templates in horizontal scroll layout.
 * Handles empty, loading, and error states.
 * 
 * Uses TemplateCard components for each template.
 */

import { useState, useCallback, useEffect } from 'react'
import { useTemplates } from '@/hooks/useTemplates'
import { TemplateCard } from './TemplateCard'
import { TemplateConfirmSheet } from './TemplateConfirmSheet'
import { Card } from '@/components/common'
import { trackEvent } from '@/lib/analytics'
import type { MealTemplate, TemplateItem, LogPortionType } from '@/db/types'

interface TemplatesSectionProps {
  onLogTemplate: (items: Array<{ foodId: string; foodType: 'system' | 'custom'; portion: LogPortionType }>) => Promise<void>
  onAddTemplate: () => void
}

/**
 * Selection state for template logging.
 * Tracks which items to log and their portions.
 */
interface ItemSelection {
  itemId: string
  selected: boolean
  portion: LogPortionType
}

/**
 * Templates section component with horizontal scroll layout.
 * Displays templates with empty/loading/error states.
 */
export function TemplatesSection({
  onLogTemplate,
  onAddTemplate,
}: TemplatesSectionProps) {
  const { templates, isLoading, error, refresh } = useTemplates()
  
  // Selected template for confirmation sheet
  const [selectedTemplate, setSelectedTemplate] = useState<{
    template: MealTemplate
    items: TemplateItem[]
  } | null>(null)

  // Track section visibility on mount
  useEffect(() => {
    if (!isLoading) {
      trackEvent('quickadd_section_visible', {
        section: 'templates',
      })
    }
  }, [isLoading])

  // Handle template card press - open confirmation sheet
  const handleTemplatePress = useCallback((template: MealTemplate, items: TemplateItem[]) => {
    setSelectedTemplate({ template, items })
  }, [])

  // Handle template confirmation - log all selected items
  const handleConfirm = useCallback(
    async (selections: ItemSelection[]) => {
      if (!selectedTemplate) return

      // Convert selections to log format
      // Use the portion from selection (may have been adjusted) or fall back to template item portion
      const itemsToLog = selections
        .filter((s) => s.selected)
        .map((s) => {
          const item = selectedTemplate.items.find((i) => i.id === s.itemId)
          if (!item) return null
          return {
            foodId: item.foodId,
            foodType: item.foodType,
            portion: s.portion || item.portion, // Use adjusted portion or template default
          }
        })
        .filter((item): item is { foodId: string; foodType: 'system' | 'custom'; portion: LogPortionType } => item !== null)

      const itemsSkipped = selections.filter((s) => !s.selected).length

      // Track analytics: template logged
      trackEvent('template_logged', {
        template_id: selectedTemplate.template.id,
        items_logged: itemsToLog.length,
        items_skipped: itemsSkipped,
      })

      await onLogTemplate(itemsToLog)
      setSelectedTemplate(null)
    },
    [selectedTemplate, onLogTemplate]
  )

  // Handle close confirmation sheet
  const handleCloseSheet = useCallback(() => {
    setSelectedTemplate(null)
  }, [])

  // Empty state: no templates created
  if (!isLoading && !error && templates.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>📋</span> Your Templates
        </h2>
        <button
          // Empty-state action: lets a new user start defining their very first meal template
          // so it aligns with the acceptance criteria copy and guides them towards the template flow.
          onClick={onAddTemplate}
          className="w-full py-8 rounded-card border border-dashed border-border bg-background hover:bg-surface-alt transition-colors"
        >
          <span className="text-body text-foreground-muted">
            + Create your first meal template
          </span>
        </button>
      </section>
    )
  }

  // Error state: database failure
  if (error) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>📋</span> Your Templates
        </h2>
        <Card variant="default" className="text-center py-8">
          <p className="text-body text-foreground-muted mb-4">
            Couldn't load templates
          </p>
          <button
            onClick={refresh}
            className="text-primary hover:underline text-caption"
          >
            Retry
          </button>
        </Card>
      </section>
    )
  }

  // Loading state: skeleton cards
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>📋</span> Your Templates
        </h2>
        <div className="flex gap-3 overflow-x-auto animate-pulse">
          {[1, 2].map((i) => (
            <Card key={i} variant="default" className="min-w-[160px] min-h-[180px]">
              <span className="sr-only">Loading...</span>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  // Normal state: display templates in horizontal scroll
  return (
    <>
      <section className="mb-8">
        <h2 className="text-title text-foreground mb-4 flex items-center gap-2">
          <span>📋</span> Your Templates
        </h2>
        <div className="flex flex-col gap-3">
          {templates.map(({ template, items }) => (
            <TemplateCard
              key={template.id}
              template={template}
              itemCount={items.length}
              onPress={() => handleTemplatePress(template, items)}
            />
          ))}
          {/* Add new template button */}
          <button
            onClick={onAddTemplate}
            className="w-full py-4 rounded-card border border-dashed border-border bg-background hover:bg-surface-alt transition-colors"
          >
            <span className="text-body text-foreground-muted">
              + Create new template
            </span>
          </button>
        </div>
      </section>

      {/* Template confirmation sheet */}
      {selectedTemplate && (
        <TemplateConfirmSheet
          template={selectedTemplate.template}
          items={selectedTemplate.items}
          isOpen={selectedTemplate !== null}
          onClose={handleCloseSheet}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
