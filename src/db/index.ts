/**
 * Database module exports for Calo Tracker.
 * Provides unified access to database operations.
 */

import type { MigrationResult } from './migrate-localStorage'

// Connection and query utilities
export {
  getDatabase,
  persistDatabase,
  runSQL,
  querySQL,
  queryOneSQL,
  transactionSQL,
  closeDatabase,
  exportDatabase,
  getDatabaseSize,
} from './connection'

// Initialisation and schema management
export { initDatabase, resetDatabase, getSchemaVersion } from './init'

// Seeding
export { seedSystemFoods, getSystemFoodCount } from './seed'

// Migration from localStorage
export {
  migrateFromLocalStorage,
  isMigrationCompleted,
  clearLegacyStorage,
  resetMigrationStatus,
  type MigrationResult,
} from './migrate-localStorage'

// Types
export type {
  PortionSize,
  LogPortionType,
  FoodType,
  FoodCategory,
  UserProfile,
  SystemFood,
  CustomFood,
  FoodLog,
  Favorite,
  RecentSearch,
  DailySummary,
  SchemaVersion,
} from './types'

export { DB_LIMITS } from './types'

// Repositories (data access layer)
export * from './repositories'

/**
 * Initialises the complete database setup.
 * Call this on app startup.
 * Handles schema creation, seeding, and localStorage migration.
 */
export async function setupDatabase(): Promise<MigrationResult | null> {
  const { initDatabase } = await import('./init')
  const { seedSystemFoods } = await import('./seed')
  const { migrateFromLocalStorage, isMigrationCompleted } = await import(
    './migrate-localStorage'
  )

  // Step 1: Initialise schema
  await initDatabase()

  // Step 2: Seed system foods
  await seedSystemFoods()

  // Step 3: Migrate from localStorage if needed
  if (!isMigrationCompleted()) {
    return await migrateFromLocalStorage()
  }

  return null
}
