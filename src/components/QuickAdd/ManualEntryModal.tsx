/**
 * ManualEntryModal - Bottom sheet form for manual food entry.
 * Allows users to log foods not in the database with name and nutritional values.
 * Supports optional "Save as custom food" checkbox for reuse.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Maximum values per validation rules
const MAX_NAME_LENGTH = 50
const MAX_KCAL = 9999
const MAX_MACRO = 999
const HIGH_CALORIE_WARNING = 5000

// Form field validation errors
interface ValidationErrors {
  name?: string
  kcal?: string
  protein?: string
  carbs?: string
  fat?: string
}

// Form data structure
export interface ManualEntryFormData {
  name: string
  kcal: string
  protein: string
  carbs: string
  fat: string
  saveAsCustom: boolean
}

interface ManualEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ManualEntryFormData) => Promise<void>
  /** Pre-fill name from failed search query */
  prefillName?: string
  /** Whether user is at custom food limit (30) */
  isAtCustomFoodLimit?: boolean
  /** Current custom food count for warning */
  customFoodCount?: number
}

export function ManualEntryModal({
  isOpen,
  onClose,
  onSave,
  prefillName = '',
  isAtCustomFoodLimit = false,
  customFoodCount = 0,
}: ManualEntryModalProps) {
  // Form state
  const [formData, setFormData] = useState<ManualEntryFormData>({
    name: prefillName,
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    saveAsCustom: true, // Checked by default to encourage saving for reuse
  })

  // Validation errors
  const [errors, setErrors] = useState<ValidationErrors>({})

  // High calorie warning state
  const [showHighCalorieWarning, setShowHighCalorieWarning] = useState(false)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ref for name input auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: prefillName,
        kcal: '',
        protein: '',
        carbs: '',
        fat: '',
        saveAsCustom: true, // Checked by default to encourage saving for reuse
      })
      setErrors({})
      setShowHighCalorieWarning(false)

      // Focus name input after animation
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, prefillName])

  /**
   * Handle input change with validation.
   */
  const handleChange = useCallback(
    (field: keyof ManualEntryFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error when user starts typing
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }

      // Check high calorie warning
      if (field === 'kcal' && typeof value === 'string') {
        const kcal = parseFloat(value)
        setShowHighCalorieWarning(!isNaN(kcal) && kcal > HIGH_CALORIE_WARNING)
      }
    },
    [errors]
  )

  /**
   * Validate form before submission.
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {}

    // Name validation (FR-004.1)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be ${MAX_NAME_LENGTH} characters or less`
    }

    // Calories validation (FR-004.2)
    const kcal = parseFloat(formData.kcal)
    if (!formData.kcal.trim()) {
      newErrors.kcal = 'Calories is required'
    } else if (isNaN(kcal) || kcal <= 0) {
      newErrors.kcal = 'Calories must be a positive number'
    } else if (kcal > MAX_KCAL) {
      newErrors.kcal = `Calories must be ${MAX_KCAL} or less`
    }

    // Optional macro validation (FR-004.3)
    if (formData.protein.trim()) {
      const protein = parseFloat(formData.protein)
      if (isNaN(protein) || protein < 0) {
        newErrors.protein = 'Protein must be non-negative'
      } else if (protein > MAX_MACRO) {
        newErrors.protein = `Protein must be ${MAX_MACRO}g or less`
      }
    }

    if (formData.carbs.trim()) {
      const carbs = parseFloat(formData.carbs)
      if (isNaN(carbs) || carbs < 0) {
        newErrors.carbs = 'Carbs must be non-negative'
      } else if (carbs > MAX_MACRO) {
        newErrors.carbs = `Carbs must be ${MAX_MACRO}g or less`
      }
    }

    if (formData.fat.trim()) {
      const fat = parseFloat(formData.fat)
      if (isNaN(fat) || fat < 0) {
        newErrors.fat = 'Fat must be non-negative'
      } else if (fat > MAX_MACRO) {
        newErrors.fat = `Fat must be ${MAX_MACRO}g or less`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  /**
   * Handle form submission.
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (!validateForm()) return

      setIsSubmitting(true)
      try {
        await onSave(formData)
        onClose()
      } catch (error) {
        console.error('Failed to save manual entry:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, onSave, onClose]
  )

  // Calculate remaining custom food slots
  const customFoodSlotsRemaining = 30 - customFoodCount

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-background-card rounded-t-sheet shadow-sheet',
          'animate-slide-up safe-bottom',
          'max-h-[90vh] overflow-y-auto'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-entry-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-card border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 id="manual-entry-title" className="text-title text-foreground">
              Add Food Manually
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 rounded-full flex items-center justify-center hover:bg-gray-20 transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-foreground-muted" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
          {/* Name field */}
          <div>
            <label
              htmlFor="food-name"
              className="block text-body font-medium text-foreground mb-2"
            >
              Food Name <span className="text-secondary">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="food-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Homemade salad"
              maxLength={MAX_NAME_LENGTH}
              className={cn(
                'w-full h-12 px-4 rounded-input',
                'bg-background border',
                'text-body text-foreground placeholder:text-foreground-muted',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                errors.name ? 'border-secondary' : 'border-border'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-caption text-secondary">{errors.name}</p>
            )}
          </div>

          {/* Calories field */}
          <div>
            <label
              htmlFor="food-kcal"
              className="block text-body font-medium text-foreground mb-2"
            >
              Calories (kcal) <span className="text-secondary">*</span>
            </label>
            <input
              id="food-kcal"
              type="number"
              inputMode="numeric"
              value={formData.kcal}
              onChange={(e) => handleChange('kcal', e.target.value)}
              placeholder="e.g., 350"
              min="1"
              max={MAX_KCAL}
              className={cn(
                'w-full h-12 px-4 rounded-input',
                'bg-background border',
                'text-body text-foreground placeholder:text-foreground-muted',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                errors.kcal ? 'border-secondary' : 'border-border'
              )}
            />
            {errors.kcal && (
              <p className="mt-1 text-caption text-secondary">{errors.kcal}</p>
            )}
            {showHighCalorieWarning && !errors.kcal && (
              <div className="mt-2 flex items-center gap-2 p-2 rounded-chip bg-yellow-20">
                <AlertTriangle size={16} className="text-yellow-60 shrink-0" />
                <p className="text-caption text-foreground">
                  This seems high. Are you sure?
                </p>
              </div>
            )}
          </div>

          {/* Macros section */}
          <div className="space-y-3">
            <p className="text-caption text-foreground-muted">
              Optional macros (grams)
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Protein */}
              <div>
                <label htmlFor="food-protein" className="sr-only">
                  Protein
                </label>
                <input
                  id="food-protein"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  placeholder="Protein"
                  min="0"
                  max={MAX_MACRO}
                  className={cn(
                    'w-full h-12 px-3 rounded-input',
                    'bg-background border',
                    'text-body text-foreground placeholder:text-foreground-muted',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.protein ? 'border-secondary' : 'border-border'
                  )}
                />
                {errors.protein && (
                  <p className="mt-1 text-xs text-secondary">{errors.protein}</p>
                )}
              </div>

              {/* Carbs */}
              <div>
                <label htmlFor="food-carbs" className="sr-only">
                  Carbs
                </label>
                <input
                  id="food-carbs"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  placeholder="Carbs"
                  min="0"
                  max={MAX_MACRO}
                  className={cn(
                    'w-full h-12 px-3 rounded-input',
                    'bg-background border',
                    'text-body text-foreground placeholder:text-foreground-muted',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.carbs ? 'border-secondary' : 'border-border'
                  )}
                />
                {errors.carbs && (
                  <p className="mt-1 text-xs text-secondary">{errors.carbs}</p>
                )}
              </div>

              {/* Fat */}
              <div>
                <label htmlFor="food-fat" className="sr-only">
                  Fat
                </label>
                <input
                  id="food-fat"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  placeholder="Fat"
                  min="0"
                  max={MAX_MACRO}
                  className={cn(
                    'w-full h-12 px-3 rounded-input',
                    'bg-background border',
                    'text-body text-foreground placeholder:text-foreground-muted',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.fat ? 'border-secondary' : 'border-border'
                  )}
                />
                {errors.fat && (
                  <p className="mt-1 text-xs text-secondary">{errors.fat}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save as custom food checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="save-as-custom"
              type="checkbox"
              checked={formData.saveAsCustom}
              onChange={(e) => handleChange('saveAsCustom', e.target.checked)}
              disabled={isAtCustomFoodLimit}
              className={cn(
                'mt-1 h-5 w-5 rounded',
                'border-border',
                'text-primary focus:ring-ring',
                isAtCustomFoodLimit && 'opacity-50 cursor-not-allowed'
              )}
            />
            <div>
              <label
                htmlFor="save-as-custom"
                className={cn(
                  'text-body text-foreground',
                  isAtCustomFoodLimit && 'text-foreground-muted'
                )}
              >
                Save as custom food for reuse
              </label>
              {isAtCustomFoodLimit ? (
                // When the user is at the hard limit, we explicitly explain why they cannot
                // enable the "Save as custom" option and how to resolve it.
                <p className="text-caption text-secondary">
                  You've reached 30 custom foods. Manage your list to add more.
                </p>
              ) : customFoodSlotsRemaining > 0 ? (
                // Always show how many slots remain so users understand their available
                // capacity, not only when close to the limit. This addresses the confusion
                // where the custom food count felt invisible in the UI.
                <p className="text-caption text-foreground-muted">
                  {customFoodSlotsRemaining} custom food slot
                  {customFoodSlotsRemaining === 1 ? '' : 's'} remaining
                </p>
              ) : null}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full h-12 rounded-pill',
              'bg-primary text-primary-foreground',
              'text-body font-medium',
              'hover:bg-primary-dark',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              'Add Food'
            )}
          </button>
        </form>
      </div>
    </>
  )
}
