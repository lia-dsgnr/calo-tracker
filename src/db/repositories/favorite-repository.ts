/**
 * Favorite repository.
 * Handles user's favorite foods list.
 */

import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'
import { runSQL, querySQL, queryOneSQL } from '../connection'
import type { Favorite, FoodType, LogPortionType } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type
interface FavoriteRow {
  id: string
  user_id: string
  food_type: string
  food_id: string
  sort_order: number
  default_portion: string | null
  use_count: number | null
  last_used_at: number | null
  created_at: number
  deleted_at: number | null
}

/**
 * Maps database row to Favorite entity.
 */
function mapRowToFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    foodType: row.food_type as FoodType,
    foodId: row.food_id,
    sortOrder: row.sort_order,
    defaultPortion: (row.default_portion ?? 'M') as LogPortionType,
    useCount: row.use_count ?? 0,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  }
}

/**
 * Adds a food to favorites.
 * Returns null if limit reached (20 max) or already favorited.
 */
export async function addFavorite(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<Favorite | null> {
  // Check if already favorited
  const existing = await getFavorite(userId, foodType, foodId)
  if (existing) {
    return existing
  }

  // Check limit
  const count = await getFavoriteCount(userId)
  if (count >= DB_LIMITS.MAX_FAVORITES_PER_USER) {
    return null
  }

  // Get next sort order
  const maxOrder = await queryOneSQL<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM favorite WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  )
  const sortOrder = (maxOrder?.max_order ?? -1) + 1

  const id = uuidv4()
  const now = Date.now()

  await runSQL(
    `INSERT INTO favorite (id, user_id, food_type, food_id, sort_order, default_portion, use_count, last_used_at, created_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [id, userId, foodType, foodId, sortOrder, 'M', 0, null, now]
  )

  return getFavoriteById(id)
}

/**
 * Gets a favorite by ID.
 */
export async function getFavoriteById(id: string): Promise<Favorite | null> {
  const row = await queryOneSQL<FavoriteRow>(
    'SELECT * FROM favorite WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return row ? mapRowToFavorite(row) : null
}

/**
 * Gets a specific favorite by user, type, and food ID.
 */
export async function getFavorite(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<Favorite | null> {
  const row = await queryOneSQL<FavoriteRow>(
    `SELECT * FROM favorite 
     WHERE user_id = ? AND food_type = ? AND food_id = ? AND deleted_at IS NULL`,
    [userId, foodType, foodId]
  )
  return row ? mapRowToFavorite(row) : null
}

/**
 * Gets all favorites for a user, ordered by sort_order.
 */
export async function getFavoritesByUser(userId: string): Promise<Favorite[]> {
  const rows = await querySQL<FavoriteRow>(
    `SELECT * FROM favorite 
     WHERE user_id = ? AND deleted_at IS NULL
     ORDER BY sort_order ASC`,
    [userId]
  )
  return rows.map(mapRowToFavorite)
}

/**
 * Checks if a food is favorited.
 */
export async function isFavorited(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<boolean> {
  const favorite = await getFavorite(userId, foodType, foodId)
  return favorite !== null
}

/**
 * Removes a food from favorites.
 */
export async function removeFavorite(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<boolean> {
  await runSQL(
    `UPDATE favorite SET deleted_at = ? 
     WHERE user_id = ? AND food_type = ? AND food_id = ? AND deleted_at IS NULL`,
    [Date.now(), userId, foodType, foodId]
  )
  return true
}

/**
 * Removes a favorite by ID.
 */
export async function removeFavoriteById(id: string): Promise<boolean> {
  await runSQL('UPDATE favorite SET deleted_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])
  return true
}

/**
 * Updates sort order of favorites (for reordering).
 */
export async function updateFavoriteOrder(
  userId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await runSQL(
      'UPDATE favorite SET sort_order = ? WHERE id = ? AND user_id = ?',
      [i, orderedIds[i], userId]
    )
  }
}

/**
 * Gets favorite count for a user.
 */
export async function getFavoriteCount(userId: string): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM favorite WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  )
  return result?.count ?? 0
}

/**
 * Toggles favorite status for a food.
 * Returns the favorite if added, null if removed.
 */
export async function toggleFavorite(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<Favorite | null> {
  const existing = await getFavorite(userId, foodType, foodId)

  if (existing) {
    await removeFavoriteById(existing.id)
    return null
  }

  return addFavorite(userId, foodType, foodId)
}

/**
 * Calculates frequency score for a favorite based on logging history.
 * Algorithm: score = (log_count_7d * 0.6) + (log_count_30d * 0.3) + (recency_score * 0.1)
 * Higher score = more frequently/recently used = appears higher in grid.
 */
export async function calculateFavoriteScore(
  userId: string,
  foodType: FoodType,
  foodId: string
): Promise<number> {
  const now = Date.now()
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  // Count logs in last 7 days
  const count7d = await queryOneSQL<{ count: number }>(
    `SELECT COUNT(*) as count 
     FROM food_log 
     WHERE user_id = ? AND food_type = ? AND food_id = ? 
       AND logged_date >= ? AND deleted_at IS NULL`,
    [userId, foodType, foodId, sevenDaysAgo]
  )

  // Count logs in last 30 days
  const count30d = await queryOneSQL<{ count: number }>(
    `SELECT COUNT(*) as count 
     FROM food_log 
     WHERE user_id = ? AND food_type = ? AND food_id = ? 
       AND logged_date >= ? AND deleted_at IS NULL`,
    [userId, foodType, foodId, thirtyDaysAgo]
  )

  // Get last used timestamp from favorite record
  const favorite = await getFavorite(userId, foodType, foodId)
  const lastUsedAt = favorite?.lastUsedAt

  // Calculate recency score (0-1, decays over 30 days)
  let recencyScore = 0
  if (lastUsedAt) {
    const daysSinceLastUse = (now - lastUsedAt) / (1000 * 60 * 60 * 24)
    recencyScore = Math.max(0, 1 - daysSinceLastUse / 30)
  }

  // Weighted frequency score
  const logCount7d = count7d?.count ?? 0
  const logCount30d = count30d?.count ?? 0

  return logCount7d * 0.6 + logCount30d * 0.3 + recencyScore * 0.1
}

/**
 * Gets favorites sorted by frequency score (highest first).
 * Used for Smart Favorites Grid ordering.
 */
export async function getFavoritesByFrequency(
  userId: string,
  limit: number = 8
): Promise<Favorite[]> {
  const favorites = await getFavoritesByUser(userId)

  // Calculate scores for all favorites
  const favoritesWithScores = await Promise.all(
    favorites.map(async (favorite) => {
      const score = await calculateFavoriteScore(
        favorite.userId,
        favorite.foodType,
        favorite.foodId
      )
      return { favorite, score }
    })
  )

  // Sort by score (descending), then by sort_order as tiebreaker
  favoritesWithScores.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.001) {
      // Scores are effectively equal, use sort_order
      return a.favorite.sortOrder - b.favorite.sortOrder
    }
    return b.score - a.score
  })

  // Return top N favorites
  return favoritesWithScores.slice(0, limit).map((item) => item.favorite)
}

/**
 * Records use of a favorite (increments use_count and updates last_used_at).
 * Called when user logs a food that is favorited.
 */
export async function recordFavoriteUse(
  userId: string,
  foodType: FoodType,
  foodId: string,
  portion: LogPortionType
): Promise<void> {
  const favorite = await getFavorite(userId, foodType, foodId)
  if (!favorite) return

  const now = Date.now()

  // Update use tracking fields
  await runSQL(
    `UPDATE favorite 
     SET use_count = use_count + 1, 
         last_used_at = ?,
         default_portion = ?
     WHERE id = ?`,
    [now, portion, favorite.id]
  )
}

/**
 * Updates the default portion for a favorite.
 * Used when user explicitly changes portion preference.
 */
export async function updateFavoriteDefaultPortion(
  userId: string,
  foodType: FoodType,
  foodId: string,
  portion: LogPortionType
): Promise<boolean> {
  const favorite = await getFavorite(userId, foodType, foodId)
  if (!favorite) return false

  await runSQL(
    'UPDATE favorite SET default_portion = ? WHERE id = ?',
    [portion, favorite.id]
  )

  return true
}
