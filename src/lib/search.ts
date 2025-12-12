/**
 * Search utilities for Vietnamese food search.
 * Handles accent normalization, fuzzy matching, and scoring.
 */

import type { FoodItem } from '@/types'

// Vietnamese character to ASCII mapping for accent-insensitive search
const VIETNAMESE_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
}

// Search constraints
const MAX_QUERY_LENGTH = 50
const MIN_QUERY_LENGTH = 2
const FUZZY_MIN_LENGTH = 5
const MAX_LEVENSHTEIN_DISTANCE = 1

// Scoring weights
const SCORE_EXACT_PREFIX_VI = 100
const SCORE_EXACT_PREFIX_EN = 90
const SCORE_CONTAINS = 50
const SCORE_FUZZY = 20

/**
 * Normalizes Vietnamese text by removing accents.
 * Example: "Phở bò" → "pho bo"
 */
export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(char => VIETNAMESE_MAP[char] || char)
    .join('')
}

/**
 * Normalizes English text by standardizing whitespace, hyphens, apostrophes.
 * Example: "broken-rice" → "broken rice"
 */
export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Sanitizes user input: strips special characters, limits length.
 * Allows Vietnamese characters, letters, numbers, spaces.
 */
export function sanitizeQuery(text: string): string {
  // Allow Vietnamese chars, ASCII letters, numbers, spaces
  const sanitized = text
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH)

  return sanitized
}

/**
 * Calculates Levenshtein distance between two strings.
 * Used for fuzzy matching to handle typos.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

export interface SearchResult {
  food: FoodItem
  matchedField: 'vi' | 'en' | 'fuzzy'
}

/**
 * Scores a food item and returns which field matched.
 */
function scoreMatchWithField(
  food: FoodItem,
  normalizedQuery: string,
  useFuzzy: boolean
): { score: number; matchedField: 'vi' | 'en' | 'fuzzy' } {
  const nameVi = normalizeVietnamese(food.name_vi)
  const nameEn = normalizeEnglish(food.name_en)

  // Vietnamese name matches (prefix or contains)
  if (nameVi.startsWith(normalizedQuery) || nameVi.includes(normalizedQuery)) {
    return { score: nameVi.startsWith(normalizedQuery) ? SCORE_EXACT_PREFIX_VI : SCORE_CONTAINS, matchedField: 'vi' }
  }

  // English name matches (prefix or contains)
  if (nameEn.startsWith(normalizedQuery) || nameEn.includes(normalizedQuery)) {
    return { score: nameEn.startsWith(normalizedQuery) ? SCORE_EXACT_PREFIX_EN : SCORE_CONTAINS, matchedField: 'en' }
  }

  // Fuzzy match
  if (useFuzzy) {
    const viWords = nameVi.split(' ')
    const enWords = nameEn.split(' ')

    for (const word of viWords) {
      if (word.length >= 3 && Math.abs(word.length - normalizedQuery.length) <= 2) {
        const distance = levenshteinDistance(normalizedQuery, word)
        if (distance <= MAX_LEVENSHTEIN_DISTANCE) {
          return { score: SCORE_FUZZY, matchedField: 'fuzzy' }
        }
      }
    }

    for (const word of enWords) {
      if (word.length >= 3 && Math.abs(word.length - normalizedQuery.length) <= 2) {
        const distance = levenshteinDistance(normalizedQuery, word)
        if (distance <= MAX_LEVENSHTEIN_DISTANCE) {
          return { score: SCORE_FUZZY, matchedField: 'fuzzy' }
        }
      }
    }
  }

  return { score: 0, matchedField: 'vi' }
}

/**
 * Searches foods by query with accent-insensitive and fuzzy matching.
 * Returns all matches sorted by relevance score with match info.
 */
export function searchFoods(foods: FoodItem[], query: string): SearchResult[] {
  const trimmed = query.trim()

  // Require minimum characters to search
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return []
  }

  const normalizedQuery = normalizeVietnamese(trimmed.toLowerCase())
  const useFuzzy = trimmed.length >= FUZZY_MIN_LENGTH

  return foods
    .map(food => {
      const { score, matchedField } = scoreMatchWithField(food, normalizedQuery, useFuzzy)
      return { food, score, matchedField }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ food, matchedField }) => ({ food, matchedField }))
}

/**
 * Highlights matching text in a string by wrapping matches in markers.
 * Returns an array of { text, highlighted } segments for rendering.
 */
export function highlightMatches(
  text: string,
  query: string
): Array<{ text: string; highlighted: boolean }> {
  if (!query.trim()) {
    return [{ text, highlighted: false }]
  }

  const normalizedText = normalizeVietnamese(text.toLowerCase())
  const normalizedQuery = normalizeVietnamese(query.toLowerCase().trim())

  const index = normalizedText.indexOf(normalizedQuery)

  if (index === -1) {
    return [{ text, highlighted: false }]
  }

  const segments: Array<{ text: string; highlighted: boolean }> = []

  if (index > 0) {
    segments.push({ text: text.slice(0, index), highlighted: false })
  }

  segments.push({
    text: text.slice(index, index + normalizedQuery.length),
    highlighted: true
  })

  if (index + normalizedQuery.length < text.length) {
    segments.push({
      text: text.slice(index + normalizedQuery.length),
      highlighted: false
    })
  }

  return segments
}

// Export constants for external use
export const SEARCH_CONSTANTS = {
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  FUZZY_MIN_LENGTH,
} as const
