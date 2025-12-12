/**
 * Food repository.
 * Handles queries for system foods and custom foods.
 */

import { v4 as uuidv4 } from 'uuid'
import { runSQL, querySQL, queryOneSQL } from '../connection'
import type {
  SystemFood,
  CustomFood,
  FoodCategory,
  PortionSize,
} from '../types'
import { DB_LIMITS } from '../types'

// Raw database row types
interface SystemFoodRow {
  id: string
  name_vi: string
  name_en: string
  category: string
  serving_description: string | null
  confidence: number
  kcal_s: number
  protein_s: number
  fat_s: number
  carbs_s: number
  fibre_s: number | null
  sugar_s: number | null
  sodium_s: number | null
  kcal_m: number
  protein_m: number
  fat_m: number
  carbs_m: number
  fibre_m: number | null
  sugar_m: number | null
  sodium_m: number | null
  kcal_l: number
  protein_l: number
  fat_l: number
  carbs_l: number
  fibre_l: number | null
  sugar_l: number | null
  sodium_l: number | null
  is_active: number
}

interface CustomFoodRow {
  id: string
  user_id: string
  name: string
  kcal: number
  protein: number | null
  fat: number | null
  carbs: number | null
  fibre: number | null
  sugar: number | null
  sodium: number | null
  created_at: number
  updated_at: number
  deleted_at: number | null
}

/**
 * Maps database row to SystemFood entity.
 */
function mapRowToSystemFood(row: SystemFoodRow): SystemFood {
  return {
    id: row.id,
    nameVi: row.name_vi,
    nameEn: row.name_en,
    category: row.category as FoodCategory,
    servingDescription: row.serving_description,
    confidence: row.confidence,
    kcalS: row.kcal_s,
    proteinS: row.protein_s,
    fatS: row.fat_s,
    carbsS: row.carbs_s,
    fibreS: row.fibre_s,
    sugarS: row.sugar_s,
    sodiumS: row.sodium_s,
    kcalM: row.kcal_m,
    proteinM: row.protein_m,
    fatM: row.fat_m,
    carbsM: row.carbs_m,
    fibreM: row.fibre_m,
    sugarM: row.sugar_m,
    sodiumM: row.sodium_m,
    kcalL: row.kcal_l,
    proteinL: row.protein_l,
    fatL: row.fat_l,
    carbsL: row.carbs_l,
    fibreL: row.fibre_l,
    sugarL: row.sugar_l,
    sodiumL: row.sodium_l,
    isActive: row.is_active === 1,
  }
}

/**
 * Maps database row to CustomFood entity.
 */
function mapRowToCustomFood(row: CustomFoodRow): CustomFood {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    kcal: row.kcal,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    fibre: row.fibre,
    sugar: row.sugar,
    sodium: row.sodium,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

// ============ System Foods ============

/**
 * Gets all active system foods.
 */
export async function getAllSystemFoods(): Promise<SystemFood[]> {
  const rows = await querySQL<SystemFoodRow>(
    'SELECT * FROM system_food WHERE is_active = 1 ORDER BY name_vi'
  )
  return rows.map(mapRowToSystemFood)
}

/**
 * Gets system foods by category.
 */
export async function getSystemFoodsByCategory(
  category: FoodCategory
): Promise<SystemFood[]> {
  const rows = await querySQL<SystemFoodRow>(
    'SELECT * FROM system_food WHERE category = ? AND is_active = 1 ORDER BY name_vi',
    [category]
  )
  return rows.map(mapRowToSystemFood)
}

/**
 * Gets a system food by ID.
 */
export async function getSystemFoodById(
  id: string
): Promise<SystemFood | null> {
  const row = await queryOneSQL<SystemFoodRow>(
    'SELECT * FROM system_food WHERE id = ?',
    [id]
  )
  return row ? mapRowToSystemFood(row) : null
}

/**
 * Searches system foods by name (Vietnamese or English).
 */
export async function searchSystemFoods(query: string): Promise<SystemFood[]> {
  const searchTerm = `%${query.toLowerCase()}%`
  const rows = await querySQL<SystemFoodRow>(
    `SELECT * FROM system_food 
     WHERE is_active = 1 
       AND (LOWER(name_vi) LIKE ? OR LOWER(name_en) LIKE ?)
     ORDER BY 
       CASE 
         WHEN LOWER(name_vi) LIKE ? THEN 0
         WHEN LOWER(name_en) LIKE ? THEN 1
         ELSE 2
       END,
       name_vi`,
    [searchTerm, searchTerm, `${query.toLowerCase()}%`, `${query.toLowerCase()}%`]
  )
  return rows.map(mapRowToSystemFood)
}

/**
 * Gets nutrition data for a system food at a specific portion.
 */
export function getSystemFoodNutrition(
  food: SystemFood,
  portion: PortionSize
): { kcal: number; protein: number; fat: number; carbs: number } {
  switch (portion) {
    case 'S':
      return {
        kcal: food.kcalS,
        protein: food.proteinS,
        fat: food.fatS,
        carbs: food.carbsS,
      }
    case 'M':
      return {
        kcal: food.kcalM,
        protein: food.proteinM,
        fat: food.fatM,
        carbs: food.carbsM,
      }
    case 'L':
      return {
        kcal: food.kcalL,
        protein: food.proteinL,
        fat: food.fatL,
        carbs: food.carbsL,
      }
  }
}

// ============ Custom Foods ============

/**
 * Creates a custom food for a user.
 * Returns null if user has reached limit (30 max).
 */
export async function createCustomFood(
  userId: string,
  data: {
    name: string
    kcal: number
    protein?: number
    fat?: number
    carbs?: number
    fibre?: number
    sugar?: number
    sodium?: number
  }
): Promise<CustomFood | null> {
  // Check limit
  const count = await getCustomFoodCount(userId)
  if (count >= DB_LIMITS.MAX_CUSTOM_FOODS_PER_USER) {
    return null
  }

  const id = uuidv4()
  const now = Date.now()

  await runSQL(
    `INSERT INTO custom_food (
      id, user_id, name, kcal, protein, fat, carbs, fibre, sugar, sodium,
      created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      id,
      userId,
      data.name,
      data.kcal,
      data.protein ?? null,
      data.fat ?? null,
      data.carbs ?? null,
      data.fibre ?? null,
      data.sugar ?? null,
      data.sodium ?? null,
      now,
      now,
    ]
  )

  return getCustomFoodById(id)
}

/**
 * Gets a custom food by ID.
 */
export async function getCustomFoodById(
  id: string
): Promise<CustomFood | null> {
  const row = await queryOneSQL<CustomFoodRow>(
    'SELECT * FROM custom_food WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return row ? mapRowToCustomFood(row) : null
}

/**
 * Gets all custom foods for a user.
 */
export async function getCustomFoodsByUser(
  userId: string
): Promise<CustomFood[]> {
  const rows = await querySQL<CustomFoodRow>(
    'SELECT * FROM custom_food WHERE user_id = ? AND deleted_at IS NULL ORDER BY name',
    [userId]
  )
  return rows.map(mapRowToCustomFood)
}

/**
 * Updates a custom food.
 */
export async function updateCustomFood(
  id: string,
  updates: Partial<
    Pick<
      CustomFood,
      'name' | 'kcal' | 'protein' | 'fat' | 'carbs' | 'fibre' | 'sugar' | 'sodium'
    >
  >
): Promise<CustomFood | null> {
  const setClauses: string[] = []
  const values: unknown[] = []

  if (updates.name !== undefined) {
    setClauses.push('name = ?')
    values.push(updates.name)
  }
  if (updates.kcal !== undefined) {
    setClauses.push('kcal = ?')
    values.push(updates.kcal)
  }
  if (updates.protein !== undefined) {
    setClauses.push('protein = ?')
    values.push(updates.protein)
  }
  if (updates.fat !== undefined) {
    setClauses.push('fat = ?')
    values.push(updates.fat)
  }
  if (updates.carbs !== undefined) {
    setClauses.push('carbs = ?')
    values.push(updates.carbs)
  }
  if (updates.fibre !== undefined) {
    setClauses.push('fibre = ?')
    values.push(updates.fibre)
  }
  if (updates.sugar !== undefined) {
    setClauses.push('sugar = ?')
    values.push(updates.sugar)
  }
  if (updates.sodium !== undefined) {
    setClauses.push('sodium = ?')
    values.push(updates.sodium)
  }

  if (setClauses.length === 0) {
    return getCustomFoodById(id)
  }

  setClauses.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  await runSQL(
    `UPDATE custom_food SET ${setClauses.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )

  return getCustomFoodById(id)
}

/**
 * Soft deletes a custom food.
 */
export async function deleteCustomFood(id: string): Promise<boolean> {
  await runSQL('UPDATE custom_food SET deleted_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])
  return true
}

/**
 * Gets custom food count for a user.
 */
export async function getCustomFoodCount(userId: string): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM custom_food WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  )
  return result?.count ?? 0
}

/**
 * Searches custom foods by name.
 */
export async function searchCustomFoods(
  userId: string,
  query: string
): Promise<CustomFood[]> {
  const searchTerm = `%${query.toLowerCase()}%`
  const rows = await querySQL<CustomFoodRow>(
    `SELECT * FROM custom_food 
     WHERE user_id = ? AND deleted_at IS NULL AND LOWER(name) LIKE ?
     ORDER BY name`,
    [userId, searchTerm]
  )
  return rows.map(mapRowToCustomFood)
}
