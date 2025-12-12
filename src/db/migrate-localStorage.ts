/**
 * Migration utility: localStorage to SQLite.
 * Transfers existing user data from localStorage to the new SQLite database.
 * Designed for one-time migration on app upgrade.
 */

import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { getDatabase, persistDatabase, queryOneSQL } from './connection'
import { STORAGE_KEYS, readFromStorage } from '../lib/storage'
import type { LogEntry, DailyGoals, RecentItem } from '../types'

// Migration status tracking key
const MIGRATION_KEY = 'calo_migration_completed'

/**
 * Legacy data structures from localStorage
 */
interface LegacyData {
  logs: LogEntry[]
  goals: DailyGoals | null
  recentItems: RecentItem[]
}

/**
 * Migration result for reporting
 */
export interface MigrationResult {
  success: boolean
  migratedLogs: number
  migratedUser: boolean
  errors: string[]
}

/**
 * Checks if migration has already been completed.
 * Prevents duplicate migrations on subsequent app loads.
 */
export function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(MIGRATION_KEY) === 'true'
}

/**
 * Marks migration as completed.
 */
function markMigrationCompleted(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MIGRATION_KEY, 'true')
}

/**
 * Reads all legacy data from localStorage.
 */
function readLegacyData(): LegacyData {
  const logs = readFromStorage<LogEntry[]>(STORAGE_KEYS.LOGS) ?? []
  const goals = readFromStorage<DailyGoals>(STORAGE_KEYS.GOALS)
  const recentItems = readFromStorage<RecentItem[]>(STORAGE_KEYS.RECENT) ?? []

  return { logs, goals, recentItems }
}

/**
 * Creates or gets the default user profile.
 * For migration, creates a single "default" user if none exists.
 */
async function ensureDefaultUser(goals: DailyGoals | null): Promise<string> {
  const db = await getDatabase()

  // Check if default user exists
  const existingUser = await queryOneSQL<{ id: string }>(
    'SELECT id FROM user_profile LIMIT 1'
  )

  if (existingUser) {
    return existingUser.id
  }

  // Create default user with migrated or default goals
  const userId = uuidv4()
  const now = Date.now()

  const defaultGoals = goals ?? {
    dailyKcal: 1800,
    dailyProtein: 75,
    dailyCarbs: 200,
    dailyFat: 60,
  }

  db.run(
    `INSERT INTO user_profile (
      id, display_name, daily_kcal_goal, daily_protein_goal, 
      daily_carbs_goal, daily_fat_goal, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      'Default User',
      defaultGoals.dailyKcal,
      defaultGoals.dailyProtein,
      defaultGoals.dailyCarbs,
      defaultGoals.dailyFat,
      now,
      now,
    ]
  )

  return userId
}

/**
 * Converts timestamp to YYYY-MM-DD date string.
 */
function timestampToDateString(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd')
}

/**
 * Migrates log entries from localStorage to SQLite.
 */
async function migrateLogs(
  userId: string,
  logs: LogEntry[]
): Promise<{ count: number; errors: string[] }> {
  const db = await getDatabase()
  const errors: string[] = []
  let count = 0

  for (const log of logs) {
    try {
      // All legacy logs are system foods
      const logId = log.id || uuidv4()
      const loggedDate = timestampToDateString(log.timestamp)

      db.run(
        `INSERT OR IGNORE INTO food_log (
          id, user_id, food_type, food_id, portion, name_snapshot,
          kcal, protein, fat, carbs, logged_date, logged_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
          logId,
          userId,
          'system',
          log.foodId,
          log.portion,
          log.name_vi,
          log.kcal,
          log.protein,
          log.fat ?? 0,
          log.carbs ?? 0,
          loggedDate,
          log.timestamp,
        ]
      )
      count++
    } catch (error) {
      errors.push(`Failed to migrate log ${log.id}: ${String(error)}`)
    }
  }

  return { count, errors }
}

/**
 * Generates daily summaries from migrated logs.
 * Groups logs by date and calculates totals.
 */
async function generateDailySummaries(userId: string): Promise<void> {
  const db = await getDatabase()

  // Get user's goals for summary snapshots
  const user = await queryOneSQL<{
    daily_kcal_goal: number
    daily_protein_goal: number
  }>('SELECT daily_kcal_goal, daily_protein_goal FROM user_profile WHERE id = ?', [
    userId,
  ])

  if (!user) return

  // Get all unique dates from logs
  const dates = await db.exec(`
    SELECT DISTINCT logged_date FROM food_log 
    WHERE user_id = '${userId}' AND deleted_at IS NULL
  `)

  if (!dates[0]?.values) return

  const now = Date.now()

  for (const row of dates[0].values) {
    const date = row[0] as string

    // Calculate totals for this date
    const totals = await db.exec(`
      SELECT 
        SUM(kcal) as total_kcal,
        SUM(protein) as total_protein,
        SUM(fat) as total_fat,
        SUM(carbs) as total_carbs,
        COUNT(*) as log_count
      FROM food_log 
      WHERE user_id = '${userId}' 
        AND logged_date = '${date}' 
        AND deleted_at IS NULL
    `)

    if (!totals[0]?.values?.[0]) continue

    const [totalKcal, totalProtein, totalFat, totalCarbs, logCount] =
      totals[0].values[0] as number[]

    // Insert or update daily summary
    db.run(
      `INSERT OR REPLACE INTO daily_summary (
        user_id, date, total_kcal, total_protein, total_fat, total_carbs,
        log_count, goal_kcal, goal_protein, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        date,
        totalKcal ?? 0,
        totalProtein ?? 0,
        totalFat ?? 0,
        totalCarbs ?? 0,
        logCount ?? 0,
        user.daily_kcal_goal,
        user.daily_protein_goal,
        now,
      ]
    )
  }
}

/**
 * Main migration function.
 * Transfers all localStorage data to SQLite database.
 */
export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedLogs: 0,
    migratedUser: false,
    errors: [],
  }

  // Skip if already migrated
  if (isMigrationCompleted()) {
    result.success = true
    return result
  }

  try {
    // Read legacy data
    const legacyData = readLegacyData()

    // Skip if no data to migrate
    if (legacyData.logs.length === 0 && !legacyData.goals) {
      markMigrationCompleted()
      result.success = true
      return result
    }

    // Create or get default user
    const userId = await ensureDefaultUser(legacyData.goals)
    result.migratedUser = true

    // Migrate logs
    if (legacyData.logs.length > 0) {
      const logResult = await migrateLogs(userId, legacyData.logs)
      result.migratedLogs = logResult.count
      result.errors.push(...logResult.errors)
    }

    // Generate daily summaries from migrated logs
    await generateDailySummaries(userId)

    // Persist all changes
    await persistDatabase()

    // Mark migration complete
    markMigrationCompleted()

    result.success = true
  } catch (error) {
    result.errors.push(`Migration failed: ${String(error)}`)
  }

  return result
}

/**
 * Clears localStorage data after successful migration.
 * Call this only after confirming migration success.
 */
export function clearLegacyStorage(): void {
  if (typeof window === 'undefined') return

  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key)
  })
}

/**
 * Resets migration status (for testing purposes).
 */
export function resetMigrationStatus(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(MIGRATION_KEY)
}
