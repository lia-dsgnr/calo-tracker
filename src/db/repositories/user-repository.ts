/**
 * User profile repository.
 * Handles CRUD operations for user accounts and goals.
 */

import { v4 as uuidv4 } from 'uuid'
import { runSQL, querySQL, queryOneSQL } from '../connection'
import type { UserProfile } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type (snake_case)
interface UserProfileRow {
  id: string
  display_name: string | null
  daily_kcal_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  created_at: number
  updated_at: number
}

/**
 * Maps database row to UserProfile entity.
 */
function mapRowToUser(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    dailyKcalGoal: row.daily_kcal_goal,
    dailyProteinGoal: row.daily_protein_goal,
    dailyCarbsGoal: row.daily_carbs_goal,
    dailyFatGoal: row.daily_fat_goal,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Creates a new user profile.
 * Returns the created user or null if limit reached.
 */
export async function createUser(
  displayName?: string,
  goals?: Partial<
    Pick<
      UserProfile,
      'dailyKcalGoal' | 'dailyProteinGoal' | 'dailyCarbsGoal' | 'dailyFatGoal'
    >
  >
): Promise<UserProfile | null> {
  // Check user limit (10 max for testing)
  const count = await getUserCount()
  if (count >= DB_LIMITS.MAX_USERS) {
    return null
  }

  const id = uuidv4()
  const now = Date.now()

  await runSQL(
    `INSERT INTO user_profile (
      id, display_name, daily_kcal_goal, daily_protein_goal,
      daily_carbs_goal, daily_fat_goal, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      displayName ?? null,
      goals?.dailyKcalGoal ?? 1800,
      goals?.dailyProteinGoal ?? 75,
      goals?.dailyCarbsGoal ?? 200,
      goals?.dailyFatGoal ?? 60,
      now,
      now,
    ]
  )

  return getUserById(id)
}

/**
 * Gets a user by ID.
 */
export async function getUserById(id: string): Promise<UserProfile | null> {
  const row = await queryOneSQL<UserProfileRow>(
    'SELECT * FROM user_profile WHERE id = ?',
    [id]
  )
  return row ? mapRowToUser(row) : null
}

/**
 * Gets all users.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const rows = await querySQL<UserProfileRow>(
    'SELECT * FROM user_profile ORDER BY created_at DESC'
  )
  return rows.map(mapRowToUser)
}

/**
 * Gets the first (default) user.
 * Useful for single-user mode or getting current user.
 */
export async function getDefaultUser(): Promise<UserProfile | null> {
  const row = await queryOneSQL<UserProfileRow>(
    'SELECT * FROM user_profile ORDER BY created_at ASC LIMIT 1'
  )
  return row ? mapRowToUser(row) : null
}

/**
 * Updates user profile.
 */
export async function updateUser(
  id: string,
  updates: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'dailyKcalGoal'
      | 'dailyProteinGoal'
      | 'dailyCarbsGoal'
      | 'dailyFatGoal'
    >
  >
): Promise<UserProfile | null> {
  const setClauses: string[] = []
  const values: unknown[] = []

  if (updates.displayName !== undefined) {
    setClauses.push('display_name = ?')
    values.push(updates.displayName)
  }
  if (updates.dailyKcalGoal !== undefined) {
    setClauses.push('daily_kcal_goal = ?')
    values.push(updates.dailyKcalGoal)
  }
  if (updates.dailyProteinGoal !== undefined) {
    setClauses.push('daily_protein_goal = ?')
    values.push(updates.dailyProteinGoal)
  }
  if (updates.dailyCarbsGoal !== undefined) {
    setClauses.push('daily_carbs_goal = ?')
    values.push(updates.dailyCarbsGoal)
  }
  if (updates.dailyFatGoal !== undefined) {
    setClauses.push('daily_fat_goal = ?')
    values.push(updates.dailyFatGoal)
  }

  if (setClauses.length === 0) {
    return getUserById(id)
  }

  setClauses.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)

  await runSQL(
    `UPDATE user_profile SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  )

  return getUserById(id)
}

/**
 * Deletes a user and all associated data (cascade).
 */
export async function deleteUser(id: string): Promise<boolean> {
  await runSQL('DELETE FROM user_profile WHERE id = ?', [id])
  return true
}

/**
 * Gets total user count.
 */
export async function getUserCount(): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_profile'
  )
  return result?.count ?? 0
}
