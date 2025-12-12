/**
 * Favorite repository.
 * Handles user's favorite foods list.
 */

import { v4 as uuidv4 } from 'uuid'
import { runSQL, querySQL, queryOneSQL } from '../connection'
import type { Favorite, FoodType } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type
interface FavoriteRow {
  id: string
  user_id: string
  food_type: string
  food_id: string
  sort_order: number
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
    `INSERT INTO favorite (id, user_id, food_type, food_id, sort_order, created_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL)`,
    [id, userId, foodType, foodId, sortOrder, now]
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
