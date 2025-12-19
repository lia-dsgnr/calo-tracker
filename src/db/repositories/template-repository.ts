/**
 * Template repository.
 * Handles CRUD operations for meal templates and template items.
 */

import { v4 as uuidv4 } from 'uuid'
import { runSQL, querySQL, queryOneSQL, transactionSQL } from '../connection'
import type { MealTemplate, TemplateItem, FoodType, LogPortionType } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row types
interface MealTemplateRow {
  id: string
  user_id: string
  name: string
  description: string | null
  total_kcal: number
  total_protein: number
  total_fat: number
  total_carbs: number
  use_count: number
  last_used_at: number | null
  created_at: number
  updated_at: number
  deleted_at: number | null
}

interface TemplateItemRow {
  id: string
  template_id: string
  food_type: string
  food_id: string
  portion: string
  name_snapshot: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  is_required: number
  sort_order: number
}

/**
 * Maps database row to MealTemplate entity.
 */
function mapRowToTemplate(row: MealTemplateRow): MealTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    totalKcal: row.total_kcal,
    totalProtein: row.total_protein,
    totalFat: row.total_fat,
    totalCarbs: row.total_carbs,
    useCount: row.use_count,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/**
 * Maps database row to TemplateItem entity.
 */
function mapRowToTemplateItem(row: TemplateItemRow): TemplateItem {
  return {
    id: row.id,
    templateId: row.template_id,
    foodType: row.food_type as FoodType,
    foodId: row.food_id,
    portion: row.portion as LogPortionType,
    nameSnapshot: row.name_snapshot,
    kcal: row.kcal,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    isRequired: row.is_required === 1,
    sortOrder: row.sort_order,
  }
}

// ============ Templates ============

/**
 * Creates a new meal template with items.
 * Returns null if user has reached limit (10 max) or validation fails.
 */
export async function createTemplate(
  userId: string,
  data: {
    name: string
    description?: string
    items: Array<{
      foodType: FoodType
      foodId: string
      portion: LogPortionType
      nameSnapshot: string
      kcal: number
      protein: number
      fat: number
      carbs: number
      isRequired?: boolean
    }>
  }
): Promise<MealTemplate | null> {
  // Validate: name required, 1-50 characters
  const trimmedName = data.name.trim()
  if (!trimmedName || trimmedName.length > 50) {
    return null
  }

  // Validate: 2-8 items required
  if (data.items.length < 2 || data.items.length > DB_LIMITS.MAX_ITEMS_PER_TEMPLATE) {
    return null
  }

  // Check limit
  const count = await getTemplateCount(userId)
  if (count >= DB_LIMITS.MAX_TEMPLATES_PER_USER) {
    return null
  }

  const templateId = uuidv4()
  const now = Date.now()

  // Calculate totals from items
  const totals = data.items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  )

  // Create template and items in a transaction
  await transactionSQL([
    // Insert template
    {
      sql: `INSERT INTO meal_template (
        id, user_id, name, description, total_kcal, total_protein, total_fat, total_carbs,
        use_count, last_used_at, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, NULL)`,
      params: [
        templateId,
        userId,
        trimmedName,
        data.description?.trim() || null,
        totals.kcal,
        totals.protein,
        totals.fat,
        totals.carbs,
        now,
        now,
      ],
    },
    // Insert items
    ...data.items.map((item, index) => ({
      sql: `INSERT INTO template_item (
        id, template_id, food_type, food_id, portion, name_snapshot,
        kcal, protein, fat, carbs, is_required, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        uuidv4(),
        templateId,
        item.foodType,
        item.foodId,
        item.portion,
        item.nameSnapshot,
        item.kcal,
        item.protein,
        item.fat,
        item.carbs,
        item.isRequired !== false ? 1 : 0, // Default to required if not specified
        index,
      ],
    })),
  ])

  return getTemplateById(templateId)
}

/**
 * Gets a template by ID with its items.
 */
export async function getTemplateById(id: string): Promise<MealTemplate | null> {
  const row = await queryOneSQL<MealTemplateRow>(
    'SELECT * FROM meal_template WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return row ? mapRowToTemplate(row) : null
}

/**
 * Gets all templates for a user, ordered by most recently used.
 */
export async function getTemplatesByUser(userId: string): Promise<MealTemplate[]> {
  const rows = await querySQL<MealTemplateRow>(
    `SELECT * FROM meal_template 
     WHERE user_id = ? AND deleted_at IS NULL
     ORDER BY last_used_at DESC NULLS LAST, created_at DESC`,
    [userId]
  )
  return rows.map(mapRowToTemplate)
}

/**
 * Gets all items for a template.
 */
export async function getTemplateItems(templateId: string): Promise<TemplateItem[]> {
  const rows = await querySQL<TemplateItemRow>(
    `SELECT * FROM template_item 
     WHERE template_id = ?
     ORDER BY sort_order ASC`,
    [templateId]
  )
  return rows.map(mapRowToTemplateItem)
}

/**
 * Gets a template with its items (convenience method).
 */
export async function getTemplateWithItems(
  id: string
): Promise<{ template: MealTemplate; items: TemplateItem[] } | null> {
  const template = await getTemplateById(id)
  if (!template) return null

  const items = await getTemplateItems(id)
  return { template, items }
}

/**
 * Updates a template's metadata (name, description).
 * Does not modify items - use updateTemplateItems for that.
 */
export async function updateTemplate(
  id: string,
  updates: {
    name?: string
    description?: string
  }
): Promise<MealTemplate | null> {
  const setClauses: string[] = []
  const values: unknown[] = []

  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim()
    if (!trimmedName || trimmedName.length > 50) {
      return null
    }
    setClauses.push('name = ?')
    values.push(trimmedName)
  }

  if (updates.description !== undefined) {
    setClauses.push('description = ?')
    values.push(updates.description?.trim() || null)
  }

  if (setClauses.length === 0) {
    return getTemplateById(id)
  }

  setClauses.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  await runSQL(
    `UPDATE meal_template SET ${setClauses.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )

  return getTemplateById(id)
}

/**
 * Updates template items (replaces all items).
 * Recalculates template totals automatically.
 */
export async function updateTemplateItems(
  templateId: string,
  items: Array<{
    foodType: FoodType
    foodId: string
    portion: LogPortionType
    nameSnapshot: string
    kcal: number
    protein: number
    fat: number
    carbs: number
    isRequired?: boolean
  }>
): Promise<boolean> {
  // Validate: 2-8 items required
  if (items.length < 2 || items.length > DB_LIMITS.MAX_ITEMS_PER_TEMPLATE) {
    return false
  }

  // Verify template exists
  const template = await getTemplateById(templateId)
  if (!template) return false

  // Calculate new totals
  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  )

  // Update template and items in a transaction
  await transactionSQL([
    // Delete old items
    {
      sql: 'DELETE FROM template_item WHERE template_id = ?',
      params: [templateId],
    },
    // Insert new items
    ...items.map((item, index) => ({
      sql: `INSERT INTO template_item (
        id, template_id, food_type, food_id, portion, name_snapshot,
        kcal, protein, fat, carbs, is_required, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        uuidv4(),
        templateId,
        item.foodType,
        item.foodId,
        item.portion,
        item.nameSnapshot,
        item.kcal,
        item.protein,
        item.fat,
        item.carbs,
        item.isRequired !== false ? 1 : 0,
        index,
      ],
    })),
    // Update template totals
    {
      sql: `UPDATE meal_template 
            SET total_kcal = ?, total_protein = ?, total_fat = ?, total_carbs = ?, updated_at = ?
            WHERE id = ?`,
      params: [totals.kcal, totals.protein, totals.fat, totals.carbs, Date.now(), templateId],
    },
  ])

  return true
}

/**
 * Soft deletes a template (for undo functionality).
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const template = await getTemplateById(id)
  if (!template) return false

  await runSQL('UPDATE meal_template SET deleted_at = ? WHERE id = ?', [Date.now(), id])
  return true
}

/**
 * Restores a soft-deleted template (undo).
 */
export async function restoreTemplate(id: string): Promise<MealTemplate | null> {
  await runSQL('UPDATE meal_template SET deleted_at = NULL WHERE id = ?', [id])

  const row = await queryOneSQL<MealTemplateRow>('SELECT * FROM meal_template WHERE id = ?', [id])
  return row ? mapRowToTemplate(row) : null
}

/**
 * Gets template count for a user.
 */
export async function getTemplateCount(userId: string): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM meal_template WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  )
  return result?.count ?? 0
}

/**
 * Increments template use count and updates last_used_at.
 * Called when user logs a template.
 */
export async function incrementTemplateUse(templateId: string): Promise<void> {
  await runSQL(
    `UPDATE meal_template 
     SET use_count = use_count + 1, last_used_at = ?
     WHERE id = ?`,
    [Date.now(), templateId]
  )
}


