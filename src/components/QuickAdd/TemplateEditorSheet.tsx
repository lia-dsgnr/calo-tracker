/**
 * TemplateEditorSheet - Full-screen editor for creating/editing meal templates.
 * Allows setting template name, description, and managing items list.
 * Used for both creating new templates and editing existing ones.
 * 
 * Note: Full item management (adding/removing foods) is a future enhancement.
 * For MVP, this sheet focuses on editing template metadata (name, description).
 */

import { useState, useEffect, useCallback } from 'react'
import { BottomSheet } from '@/components/common'
import { cn } from '@/lib/utils'
import type { MealTemplate, TemplateItem } from '@/db/types'

interface TemplateEditorSheetProps {
  template: MealTemplate | null // null = create new, non-null = edit existing
  items: TemplateItem[] // Template items (read-only in MVP)
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string }) => Promise<void>
  onDelete?: () => Promise<void> // Only provided when editing
}

/**
 * Full-screen editor sheet for template metadata.
 * MVP: Only allows editing name and description.
 * Future: Add/remove items, reorder items, adjust portions.
 */
export function TemplateEditorSheet({
  template,
  items,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: TemplateEditorSheetProps) {
  const isEditing = template !== null

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form from template when editing
  useEffect(() => {
    if (isEditing && template) {
      setName(template.name)
      setDescription(template.description || '')
    } else {
      // Reset for new template
      setName('')
      setDescription('')
    }
  }, [isEditing, template])

  // Handle save
  const handleSave = useCallback(async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return // Validation: name required

    setIsSaving(true)
    try {
      await onSave({
        name: trimmedName,
        description: description.trim() || undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to save template:', error)
      // TODO: Show error toast
    } finally {
      setIsSaving(false)
    }
  }, [name, description, onSave, onClose])

  // Handle delete (only when editing)
  const handleDelete = useCallback(async () => {
    if (!onDelete || !confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await onDelete()
      onClose()
    } catch (error) {
      console.error('Failed to delete template:', error)
      // TODO: Show error toast
    }
  }, [onDelete, onClose])

  // Validation: name required, max 50 characters
  const isNameValid = name.trim().length > 0 && name.trim().length <= 50
  const canSave = isNameValid && !isSaving

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Template' : 'Create Template'}
      description={isEditing ? 'Edit template details' : 'Create a new meal template'}
      size="full"
      showDragHandle={true}
    >
      <div className="space-y-6">
        {/* Template name input */}
        <div>
          <label
            htmlFor="template-name"
            className="block text-body font-medium text-foreground mb-2"
          >
            Template Name *
          </label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Usual breakfast"
            maxLength={50}
            className={cn(
              'w-full px-4 py-3 rounded-card border',
              'bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              !isNameValid && name.length > 0 && 'border-error'
            )}
            aria-invalid={!isNameValid}
            aria-describedby="template-name-help"
          />
          <p
            id="template-name-help"
            className={cn(
              'mt-1 text-caption',
              !isNameValid && name.length > 0
                ? 'text-error'
                : 'text-foreground-muted'
            )}
          >
            {name.length === 0
              ? 'Name is required'
              : name.length > 50
              ? 'Name must be 50 characters or less'
              : `${50 - name.length} characters remaining`}
          </p>
        </div>

        {/* Template description input */}
        <div>
          <label
            htmlFor="template-description"
            className="block text-body font-medium text-foreground mb-2"
          >
            Description (optional)
          </label>
          <textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this template..."
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-card border border-border',
              'bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'resize-none'
            )}
          />
        </div>

        {/* Template items preview (read-only in MVP) */}
        <div>
          <h3 className="text-body font-medium text-foreground mb-3">
            Items ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-card bg-background border border-border"
              >
                <span className="text-caption text-foreground-muted w-6">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-body text-foreground">{item.nameSnapshot}</span>
                  <span className="text-caption text-foreground-muted ml-2">
                    ({item.portion})
                  </span>
                </div>
                <span className="text-caption text-foreground-muted">
                  {item.kcal} kcal
                </span>
              </div>
            ))}
          </div>
          {isEditing && items.length > 0 && (
            <p className="mt-2 text-caption text-foreground-muted">
              Note: Editing items is coming soon. For now, you can only edit the name and
              description.
            </p>
          )}
        </div>

        {/* Template summary totals */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-body font-medium text-foreground">Total</span>
              <span className="text-body font-semibold text-foreground">
                {template?.totalKcal ?? items.reduce((sum, item) => sum + item.kcal, 0)} kcal
              </span>
            </div>
            <div className="text-caption text-foreground-muted">
              Protein:{' '}
              {template?.totalProtein.toFixed(1) ??
                items.reduce((sum, item) => sum + item.protein, 0).toFixed(1)}
              g • Carbs:{' '}
              {template?.totalCarbs.toFixed(1) ??
                items.reduce((sum, item) => sum + item.carbs, 0).toFixed(1)}
              g • Fat:{' '}
              {template?.totalFat.toFixed(1) ??
                items.reduce((sum, item) => sum + item.fat, 0).toFixed(1)}
              g
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          {/* Delete button (only when editing) */}
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className={cn(
                'flex-1 py-4 px-4 rounded-pill font-medium text-body',
                'bg-error/10 text-error',
                'hover:bg-error/20 active:scale-[0.98]',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2',
                isSaving && 'opacity-50 cursor-not-allowed'
              )}
            >
              Delete
            </button>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'flex-1 py-4 px-4 rounded-pill font-medium text-body',
              'bg-primary text-primary-foreground',
              'hover:bg-primary-dark active:scale-[0.98]',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              !canSave && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}


