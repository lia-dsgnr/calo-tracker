/**
 * Recent search repository.
 * Handles storing and retrieving recent search terms.
 */

import { runSQL, querySQL, queryOneSQL } from '../connection'
import type { RecentSearch } from '../types'
import { DB_LIMITS } from '../types'

// Raw database row type
interface RecentSearchRow {
  id: number
  user_id: string
  search_term: string
  searched_at: number
}

/**
 * Maps database row to RecentSearch entity.
 */
function mapRowToSearch(row: RecentSearchRow): RecentSearch {
  return {
    id: row.id,
    userId: row.user_id,
    searchTerm: row.search_term,
    searchedAt: row.searched_at,
  }
}

/**
 * Adds a search term to recent searches.
 * Enforces FIFO limit (max 5 per user).
 * If term already exists, updates timestamp instead.
 */
export async function addRecentSearch(
  userId: string,
  searchTerm: string
): Promise<RecentSearch | null> {
  const trimmedTerm = searchTerm.trim()
  if (!trimmedTerm) return null

  const now = Date.now()

  // Check if search term already exists
  const existing = await queryOneSQL<RecentSearchRow>(
    'SELECT * FROM recent_search WHERE user_id = ? AND search_term = ?',
    [userId, trimmedTerm]
  )

  if (existing) {
    // Update timestamp to move to top
    await runSQL(
      'UPDATE recent_search SET searched_at = ? WHERE id = ?',
      [now, existing.id]
    )
    return {
      ...mapRowToSearch(existing),
      searchedAt: now,
    }
  }

  // Insert new search term
  await runSQL(
    'INSERT INTO recent_search (user_id, search_term, searched_at) VALUES (?, ?, ?)',
    [userId, trimmedTerm, now]
  )

  // Enforce FIFO limit: delete oldest if over limit
  await pruneRecentSearches(userId)

  // Return the newly created search
  const newSearch = await queryOneSQL<RecentSearchRow>(
    'SELECT * FROM recent_search WHERE user_id = ? AND search_term = ?',
    [userId, trimmedTerm]
  )

  return newSearch ? mapRowToSearch(newSearch) : null
}

/**
 * Gets recent searches for a user, ordered by most recent.
 */
export async function getRecentSearches(userId: string): Promise<RecentSearch[]> {
  const rows = await querySQL<RecentSearchRow>(
    `SELECT * FROM recent_search 
     WHERE user_id = ? 
     ORDER BY searched_at DESC
     LIMIT ?`,
    [userId, DB_LIMITS.MAX_RECENT_SEARCHES]
  )
  return rows.map(mapRowToSearch)
}

/**
 * Deletes a specific recent search.
 */
export async function deleteRecentSearch(id: number): Promise<boolean> {
  await runSQL('DELETE FROM recent_search WHERE id = ?', [id])
  return true
}

/**
 * Clears all recent searches for a user.
 */
export async function clearRecentSearches(userId: string): Promise<boolean> {
  await runSQL('DELETE FROM recent_search WHERE user_id = ?', [userId])
  return true
}

/**
 * Prunes recent searches to stay within limit (FIFO).
 */
async function pruneRecentSearches(userId: string): Promise<void> {
  // Delete searches beyond the limit, keeping only most recent
  await runSQL(
    `DELETE FROM recent_search 
     WHERE user_id = ? AND id NOT IN (
       SELECT id FROM recent_search 
       WHERE user_id = ? 
       ORDER BY searched_at DESC 
       LIMIT ?
     )`,
    [userId, userId, DB_LIMITS.MAX_RECENT_SEARCHES]
  )
}

/**
 * Gets search count for a user.
 */
export async function getRecentSearchCount(userId: string): Promise<number> {
  const result = await queryOneSQL<{ count: number }>(
    'SELECT COUNT(*) as count FROM recent_search WHERE user_id = ?',
    [userId]
  )
  return result?.count ?? 0
}
