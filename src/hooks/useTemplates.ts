/**
 * Hook for managing meal templates.
 * Fetches templates from database with their items and provides actions.
 */

import { useState, useCallback, useEffect } from 'react'
import { useDatabaseContext } from '../contexts/useDatabaseContext'
import {
  getTemplatesByUser,
  getTemplateItems,
} from '../db/repositories/template-repository'
import type { MealTemplate, TemplateItem } from '../db/types'

interface TemplateWithItems {
  template: MealTemplate
  items: TemplateItem[]
}

interface UseTemplatesReturn {
  templates: TemplateWithItems[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching and managing meal templates.
 * Resolves template items for each template and provides refresh capability.
 */
export function useTemplates(): UseTemplatesReturn {
  const { isInitialised, currentUser } = useDatabaseContext()
  const [templates, setTemplates] = useState<TemplateWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    if (!isInitialised || !currentUser) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch templates for user
      const dbTemplates = await getTemplatesByUser(currentUser.id)

      // Resolve items for each template
      const templatesWithItems = await Promise.all(
        dbTemplates.map(async (template) => {
          const items = await getTemplateItems(template.id)
          return { template, items }
        })
      )

      setTemplates(templatesWithItems)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load templates'
      setError(errorMessage)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isInitialised, currentUser])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return {
    templates,
    isLoading,
    error,
    refresh: loadTemplates,
  }
}
