/**
 * Statistics repository.
 * Handles daily summaries and aggregated statistics.
 */

import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { querySQL, queryOneSQL, runSQL } from '../connection'
import type { DailySummary } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type
interface DailySummaryRow {
  id: number
  user_id: string
  date: string
  total_kcal: number
  total_protein: number
  total_fat: number
  total_carbs: number
  log_count: number
  goal_kcal: number | null
  goal_protein: number | null
  updated_at: number
}

/**
 * Maps database row to DailySummary entity.
 */
function mapRowToSummary(row: DailySummaryRow): DailySummary {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    totalKcal: row.total_kcal,
    totalProtein: row.total_protein,
    totalFat: row.total_fat,
    totalCarbs: row.total_carbs,
    logCount: row.log_count,
    goalKcal: row.goal_kcal,
    goalProtein: row.goal_protein,
    updatedAt: row.updated_at,
  }
}

/**
 * Gets today's date string.
 */
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Gets daily summary for a specific date.
 */
export async function getDailySummary(
  userId: string,
  date: string
): Promise<DailySummary | null> {
  const row = await queryOneSQL<DailySummaryRow>(
    'SELECT * FROM daily_summary WHERE user_id = ? AND date = ?',
    [userId, date]
  )
  return row ? mapRowToSummary(row) : null
}

/**
 * Gets today's summary.
 */
export async function getTodaySummary(
  userId: string
): Promise<DailySummary | null> {
  return getDailySummary(userId, getTodayString())
}

/**
 * Gets summaries for a date range.
 */
export async function getSummariesForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailySummary[]> {
  const rows = await querySQL<DailySummaryRow>(
    `SELECT * FROM daily_summary 
     WHERE user_id = ? AND date BETWEEN ? AND ?
     ORDER BY date DESC`,
    [userId, startDate, endDate]
  )
  return rows.map(mapRowToSummary)
}

/**
 * Gets weekly statistics (current week).
 */
export async function getWeeklySummary(
  userId: string,
  referenceDate: Date = new Date()
): Promise<{
  totalKcal: number
  avgKcal: number
  totalProtein: number
  avgProtein: number
  daysLogged: number
  totalLogs: number
}> {
  const weekStart = format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const result = await queryOneSQL<{
    total_kcal: number
    avg_kcal: number
    total_protein: number
    avg_protein: number
    days_logged: number
    total_logs: number
  }>(
    `SELECT 
      COALESCE(SUM(total_kcal), 0) as total_kcal,
      COALESCE(AVG(total_kcal), 0) as avg_kcal,
      COALESCE(SUM(total_protein), 0) as total_protein,
      COALESCE(AVG(total_protein), 0) as avg_protein,
      COUNT(*) as days_logged,
      COALESCE(SUM(log_count), 0) as total_logs
    FROM daily_summary 
    WHERE user_id = ? AND date BETWEEN ? AND ? AND log_count > 0`,
    [userId, weekStart, weekEnd]
  )

  return {
    totalKcal: result?.total_kcal ?? 0,
    avgKcal: Math.round(result?.avg_kcal ?? 0),
    totalProtein: result?.total_protein ?? 0,
    avgProtein: Math.round(result?.avg_protein ?? 0),
    daysLogged: result?.days_logged ?? 0,
    totalLogs: result?.total_logs ?? 0,
  }
}

/**
 * Gets monthly statistics.
 */
export async function getMonthlySummary(
  userId: string,
  referenceDate: Date = new Date()
): Promise<{
  totalKcal: number
  avgKcal: number
  totalProtein: number
  avgProtein: number
  daysLogged: number
  totalLogs: number
  goalAchievementRate: number
}> {
  const monthStart = format(startOfMonth(referenceDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(referenceDate), 'yyyy-MM-dd')

  const result = await queryOneSQL<{
    total_kcal: number
    avg_kcal: number
    total_protein: number
    avg_protein: number
    days_logged: number
    total_logs: number
    days_under_goal: number
  }>(
    `SELECT 
      COALESCE(SUM(total_kcal), 0) as total_kcal,
      COALESCE(AVG(total_kcal), 0) as avg_kcal,
      COALESCE(SUM(total_protein), 0) as total_protein,
      COALESCE(AVG(total_protein), 0) as avg_protein,
      COUNT(*) as days_logged,
      COALESCE(SUM(log_count), 0) as total_logs,
      SUM(CASE WHEN total_kcal <= goal_kcal THEN 1 ELSE 0 END) as days_under_goal
    FROM daily_summary 
    WHERE user_id = ? AND date BETWEEN ? AND ? AND log_count > 0`,
    [userId, monthStart, monthEnd]
  )

  const daysLogged = result?.days_logged ?? 0
  const daysUnderGoal = result?.days_under_goal ?? 0
  const goalAchievementRate = daysLogged > 0 
    ? Math.round((daysUnderGoal / daysLogged) * 100) 
    : 0

  return {
    totalKcal: result?.total_kcal ?? 0,
    avgKcal: Math.round(result?.avg_kcal ?? 0),
    totalProtein: result?.total_protein ?? 0,
    avgProtein: Math.round(result?.avg_protein ?? 0),
    daysLogged,
    totalLogs: result?.total_logs ?? 0,
    goalAchievementRate,
  }
}

/**
 * Gets trend data for charts (last N days).
 */
export async function getTrendData(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; kcal: number; protein: number; goalKcal: number | null }>> {
  const endDate = getTodayString()
  const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')

  const rows = await querySQL<DailySummaryRow>(
    `SELECT * FROM daily_summary 
     WHERE user_id = ? AND date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [userId, startDate, endDate]
  )

  return rows.map((row) => ({
    date: row.date,
    kcal: row.total_kcal,
    protein: row.total_protein,
    goalKcal: row.goal_kcal,
  }))
}

/**
 * Prunes old summaries beyond retention period.
 */
export async function pruneOldSummaries(userId: string): Promise<number> {
  const cutoffDate = format(
    subDays(new Date(), DB_LIMITS.SUMMARY_RETENTION_DAYS),
    'yyyy-MM-dd'
  )

  const countResult = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_summary WHERE user_id = ? AND date < ?',
    [userId, cutoffDate]
  )
  const count = countResult?.count ?? 0

  await runSQL('DELETE FROM daily_summary WHERE user_id = ? AND date < ?', [
    userId,
    cutoffDate,
  ])

  return count
}

/**
 * Gets streak information (consecutive days with logs).
 */
export async function getStreak(
  userId: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  // Get all days with logs, ordered by date
  const rows = await querySQL<{ date: string }>(
    `SELECT date FROM daily_summary 
     WHERE user_id = ? AND log_count > 0
     ORDER BY date DESC`,
    [userId]
  )

  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const today = getTodayString()
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let previousDate: Date | null = null

  for (const row of rows) {
    const currentDate = new Date(row.date)

    if (previousDate === null) {
      // First entry: check if it's today or yesterday
      const daysDiff = Math.floor(
        (new Date(today).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff <= 1) {
        tempStreak = 1
      } else {
        // Gap from today, streak broken
        tempStreak = 1
      }
    } else {
      // Check if consecutive
      const daysDiff = Math.floor(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff === 1) {
        tempStreak++
      } else {
        // Streak broken
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
        tempStreak = 1
      }
    }

    previousDate = currentDate
  }

  // Final streak check
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak
  }

  // Current streak: only count if includes today or yesterday
  const mostRecentDate = rows[0]?.date
  const daysSinceLast = Math.floor(
    (new Date(today).getTime() - new Date(mostRecentDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (daysSinceLast <= 1) {
    // Calculate current streak from most recent
    currentStreak = 1
    for (let i = 1; i < rows.length; i++) {
      const curr = new Date(rows[i - 1].date)
      const prev = new Date(rows[i].date)
      const diff = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}
