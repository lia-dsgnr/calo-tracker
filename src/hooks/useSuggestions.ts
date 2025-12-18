/**
 * Hook for fetching suggested foods when user has no favorites.
 * Returns 6 curated foods (1 from each category) for discovery.
 */

import { useState, useEffect } from 'react'
import { getSystemFoodById } from '../db/repositories/food-repository'
import type { FoodItem, FoodCategory } from '../types'

// Curated suggestion IDs - one popular food per category
const SUGGESTED_FOOD_IDS = [
  'pho-bo-tai',           // noodles
  'com-tam-suon-bi-cha',  // rice
  'banh-mi-thit-nguoi',   // banh_mi
  'goi-cuon',             // snacks
  'ca-phe-sua-da',        // drinks
  'che-thai',             // desserts
]

interface UseSuggestionsReturn {
  suggestions: FoodItem[]
  isLoading: boolean
  error: string | null
}

// Convert SystemFood (DB) to FoodItem (UI)
function toFoodItem(sf: {
  id: string
  nameVi: string
  nameEn: string
  category: string
  servingDescription: string | null
  confidence: number
  kcalS: number
  proteinS: number
  fatS: number
  carbsS: number
  kcalM: number
  proteinM: number
  fatM: number
  carbsM: number
  kcalL: number
  proteinL: number
  fatL: number
  carbsL: number
}): FoodItem {
  return {
    id: sf.id,
    name_vi: sf.nameVi,
    name_en: sf.nameEn,
    category: sf.category as FoodCategory,
    serving: sf.servingDescription ?? '',
    confidence: sf.confidence,
    portions: {
      S: { kcal: sf.kcalS, protein: sf.proteinS, fat: sf.fatS, carbs: sf.carbsS },
      M: { kcal: sf.kcalM, protein: sf.proteinM, fat: sf.fatM, carbs: sf.carbsM },
      L: { kcal: sf.kcalL, protein: sf.proteinL, fat: sf.fatL, carbs: sf.carbsL },
    },
  }
}

/**
 * Hook for fetching curated food suggestions.
 * Used when user has no favorites to help them get started.
 */
export function useSuggestions(): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true)
      setError(null)

      try {
        const foods = await Promise.all(
          SUGGESTED_FOOD_IDS.map(async (id) => {
            const systemFood = await getSystemFoodById(id)
            return systemFood ? toFoodItem(systemFood) : null
          })
        )

        // Filter out any null values (foods not found)
        setSuggestions(foods.filter((f): f is FoodItem => f !== null))
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load suggestions'
        setError(errorMessage)
        console.error('Error loading suggestions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [])

  return { suggestions, isLoading, error }
}
