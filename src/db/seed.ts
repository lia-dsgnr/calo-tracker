/**
 * Database seeding for Calo Tracker.
 * Imports system food data from foods.json into SQLite.
 */

import { getDatabase, persistDatabase, queryOneSQL } from './connection'
import foodsData from '../data/foods.json'

interface LegacyFoodItem {
  id: string
  name_vi: string
  name_en: string
  category: string
  portions: {
    S: { kcal: number; protein: number; fat: number; carbs: number }
    M: { kcal: number; protein: number; fat: number; carbs: number }
    L: { kcal: number; protein: number; fat: number; carbs: number }
  }
  serving: string
  confidence: number
}

/**
 * Checks if system foods have already been seeded.
 */
async function isSystemFoodSeeded(): Promise<boolean> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM system_food'
  )
  return (result?.count ?? 0) > 0
}

/**
 * Seeds system food table from foods.json.
 * Only runs if table is empty (idempotent).
 */
export async function seedSystemFoods(): Promise<void> {
  const isSeeded = await isSystemFoodSeeded()

  if (isSeeded) {
    return
  }

  const db = await getDatabase()
  const foods = foodsData.foods as LegacyFoodItem[]

  // Prepare insert statement for batch efficiency
  const insertSQL = `
    INSERT INTO system_food (
      id, name_vi, name_en, category, serving_description, confidence,
      kcal_s, protein_s, fat_s, carbs_s,
      kcal_m, protein_m, fat_m, carbs_m,
      kcal_l, protein_l, fat_l, carbs_l,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `

  // Insert each food item
  for (const food of foods) {
    db.run(insertSQL, [
      food.id,
      food.name_vi,
      food.name_en,
      food.category,
      food.serving,
      food.confidence,
      // Small portion
      food.portions.S.kcal,
      food.portions.S.protein,
      food.portions.S.fat,
      food.portions.S.carbs,
      // Medium portion
      food.portions.M.kcal,
      food.portions.M.protein,
      food.portions.M.fat,
      food.portions.M.carbs,
      // Large portion
      food.portions.L.kcal,
      food.portions.L.protein,
      food.portions.L.fat,
      food.portions.L.carbs,
    ])
  }

  await persistDatabase()
}

/**
 * Gets count of seeded system foods.
 */
export async function getSystemFoodCount(): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM system_food WHERE is_active = 1'
  )
  return result?.count ?? 0
}
