/**
 * Food log repository.
 * Handles logging meals and querying history.
 */

import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'
import { runSQL, querySQL, queryOneSQL } from '../connection'
import type { FoodLog, FoodType, LogPortionType } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type
interface FoodLogRow {
  id: string
  user_id: string
  food_type: string
  food_id: string
  portion: string
  name_snapshot: string
  kcal: number
  protein: number
  fat: number
  carbs: number
  logged_date: string
  logged_at: number
  deleted_at: number | null
}

/**
 * Maps database row to FoodLog entity.
 */
function mapRowToLog(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    foodType: row.food_type as FoodType,
    foodId: row.food_id,
    portion: row.portion as LogPortionType,
    nameSnapshot: row.name_snapshot,
    kcal: row.kcal,
    protein: row.protein,
    fat: row.fat,
    carbs: row.carbs,
    loggedDate: row.logged_date,
    loggedAt: row.logged_at,
    deletedAt: row.deleted_at,
  }
}

/**
 * Gets today's date string in YYYY-MM-DD format.
 */
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Creates a new food log entry.
 * Returns null if daily limit reached (30 per day).
 */
export async function createLog(data: {
  userId: string
  foodType: FoodType
  foodId: string
  portion: LogPortionType
  nameSnapshot: string
  kcal: number
  protein: number
  fat: number
  carbs: number
}): Promise<FoodLog | null> {
  const loggedDate = getTodayString()

  // Check daily limit
  const todayCount = await getLogCountForDate(data.userId, loggedDate)
  if (todayCount >= DB_LIMITS.MAX_LOGS_PER_DAY) {
    return null
  }

  const id = uuidv4()
  const loggedAt = Date.now()

  await runSQL(
    `INSERT INTO food_log (
      id, user_id, food_type, food_id, portion, name_snapshot,
      kcal, protein, fat, carbs, logged_date, logged_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      id,
      data.userId,
      data.foodType,
      data.foodId,
      data.portion,
      data.nameSnapshot,
      data.kcal,
      data.protein,
      data.fat,
      data.carbs,
      loggedDate,
      loggedAt,
    ]
  )

  // Update daily summary
  await updateDailySummary(data.userId, loggedDate)

  return getLogById(id)
}

/**
 * Gets a log entry by ID.
 */
export async function getLogById(id: string): Promise<FoodLog | null> {
  const row = await queryOneSQL<FoodLogRow>(
    'SELECT * FROM food_log WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return row ? mapRowToLog(row) : null
}

/**
 * Gets logs for a specific date.
 */
export async function getLogsForDate(
  userId: string,
  date: string
): Promise<FoodLog[]> {
  const rows = await querySQL<FoodLogRow>(
    `SELECT * FROM food_log 
     WHERE user_id = ? AND logged_date = ? AND deleted_at IS NULL
     ORDER BY logged_at DESC`,
    [userId, date]
  )
  return rows.map(mapRowToLog)
}

/**
 * Gets today's logs for a user.
 */
export async function getTodayLogs(userId: string): Promise<FoodLog[]> {
  return getLogsForDate(userId, getTodayString())
}

/**
 * Gets logs for a date range.
 */
export async function getLogsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<FoodLog[]> {
  const rows = await querySQL<FoodLogRow>(
    `SELECT * FROM food_log 
     WHERE user_id = ? AND logged_date BETWEEN ? AND ? AND deleted_at IS NULL
     ORDER BY logged_date DESC, logged_at DESC`,
    [userId, startDate, endDate]
  )
  return rows.map(mapRowToLog)
}

/**
 * Gets recent logs (last N days).
 */
export async function getRecentLogs(
  userId: string,
  days: number = 7
): Promise<FoodLog[]> {
  const endDate = getTodayString()
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
  return getLogsForDateRange(userId, startDate, endDate)
}

/**
 * Soft deletes a log entry (for undo functionality).
 */
export async function deleteLog(id: string): Promise<boolean> {
  const log = await getLogById(id)
  if (!log) return false

  await runSQL('UPDATE food_log SET deleted_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])

  // Update daily summary
  await updateDailySummary(log.userId, log.loggedDate)

  return true
}

/**
 * Restores a soft-deleted log entry (undo).
 */
export async function restoreLog(id: string): Promise<FoodLog | null> {
  await runSQL(
    'UPDATE food_log SET deleted_at = NULL WHERE id = ?',
    [id]
  )

  const log = await queryOneSQL<FoodLogRow>(
    'SELECT * FROM food_log WHERE id = ?',
    [id]
  )

  if (log) {
    // Update daily summary
    await updateDailySummary(log.user_id, log.logged_date)
  }

  return log ? mapRowToLog(log) : null
}

/**
 * Gets log count for a specific date.
 */
export async function getLogCountForDate(
  userId: string,
  date: string
): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM food_log WHERE user_id = ? AND logged_date = ? AND deleted_at IS NULL',
    [userId, date]
  )
  return result?.count ?? 0
}

/**
 * Prunes logs older than retention period.
 */
export async function pruneOldLogs(userId: string): Promise<number> {
  const cutoffDate = format(
    subDays(new Date(), DB_LIMITS.LOG_RETENTION_DAYS),
    'yyyy-MM-dd'
  )

  // Get count before deletion
  const countResult = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM food_log WHERE user_id = ? AND logged_date < ?',
    [userId, cutoffDate]
  )
  const count = countResult?.count ?? 0

  // Delete old logs
  await runSQL('DELETE FROM food_log WHERE user_id = ? AND logged_date < ?', [
    userId,
    cutoffDate,
  ])

  return count
}

/**
 * Updates daily summary for a given date.
 * Recalculates totals from logs.
 */
async function updateDailySummary(
  userId: string,
  date: string
): Promise<void> {
  // Calculate totals
  const totals = await queryOneSQL<{
    total_kcal: number
    total_protein: number
    total_fat: number
    total_carbs: number
    log_count: number
  }>(
    `SELECT 
      COALESCE(SUM(kcal), 0) as total_kcal,
      COALESCE(SUM(protein), 0) as total_protein,
      COALESCE(SUM(fat), 0) as total_fat,
      COALESCE(SUM(carbs), 0) as total_carbs,
      COUNT(*) as log_count
    FROM food_log 
    WHERE user_id = ? AND logged_date = ? AND deleted_at IS NULL`,
    [userId, date]
  )

  // Get user's current goals for snapshot
  const user = await queryOneSQL<{
    daily_kcal_goal: number
    daily_protein_goal: number
  }>('SELECT daily_kcal_goal, daily_protein_goal FROM user_profile WHERE id = ?', [
    userId,
  ])

  const now = Date.now()

  // Upsert daily summary
  await runSQL(
    `INSERT INTO daily_summary (
      user_id, date, total_kcal, total_protein, total_fat, total_carbs,
      log_count, goal_kcal, goal_protein, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      total_kcal = excluded.total_kcal,
      total_protein = excluded.total_protein,
      total_fat = excluded.total_fat,
      total_carbs = excluded.total_carbs,
      log_count = excluded.log_count,
      updated_at = excluded.updated_at`,
    [
      userId,
      date,
      totals?.total_kcal ?? 0,
      totals?.total_protein ?? 0,
      totals?.total_fat ?? 0,
      totals?.total_carbs ?? 0,
      totals?.log_count ?? 0,
      user?.daily_kcal_goal ?? 1800,
      user?.daily_protein_goal ?? 75,
      now,
    ]
  )
}

/**
 * Gets most frequently logged foods (for "Most Used" feature).
 */
export async function getMostLoggedFoods(
  userId: string,
  days: number = 7,
  limit: number = 5
): Promise<Array<{ foodId: string; foodType: FoodType; count: number }>> {
  const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

  const rows = await querySQL<{
    food_id: string
    food_type: string
    count: number
  }>(
    `SELECT food_id, food_type, COUNT(*) as count
     FROM food_log
     WHERE user_id = ? AND logged_date >= ? AND deleted_at IS NULL
     GROUP BY food_id, food_type
     ORDER BY count DESC
     LIMIT ?`,
    [userId, cutoffDate, limit]
  )

  return rows.map((row) => ({
    foodId: row.food_id,
    foodType: row.food_type as FoodType,
    count: row.count,
  }))
}
