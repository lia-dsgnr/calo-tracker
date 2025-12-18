/**
 * TemplateCard - Card component for displaying a meal template.
 * Shows template name, item count, total kcal, and emoji preview.
 * Tap opens confirmation sheet; long-press opens edit menu (future enhancement).
 * 
 * Used in horizontal scroll list within TemplatesSection.
 */

import { Card } from '@/components/common'
import { cn } from '@/lib/utils'
import { getMealEmojiFromName } from '@/lib/food-emoji'
import type { MealTemplate } from '@/db/types'

interface TemplateCardProps {
  template: MealTemplate
  itemCount: number
  onPress: () => void
  disabled?: boolean
}

export function TemplateCard({
  template,
  itemCount,
  onPress,
  disabled = false,
}: TemplateCardProps) {
  // Template emojis now share the central food emoji config so meal preview
  // icons stay consistent with the rest of the quick-add experience.
  const emoji = getMealEmojiFromName(template.name)

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      disabled={disabled}
      className={cn(
        // Horizontal card: fixed width for scrollable list
        'min-w-[160px] max-w-[180px]',
        // Vertical layout: content stacked
        'flex flex-col gap-2'
      )}
    >
      {/* Emoji icon - large and prominent */}
      <div className="text-3xl text-center">{emoji}</div>

      {/* Template name - bold, truncated if too long */}
      <h3 className="text-body font-semibold text-foreground line-clamp-2 text-center">
        {template.name}
      </h3>

      {/* Metadata: item count and kcal */}
      <div className="flex flex-col gap-1 items-center">
        <span className="text-caption text-foreground-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <span className="text-caption font-medium text-foreground">
          {template.totalKcal} kcal
        </span>
      </div>
    </Card>
  )
}
