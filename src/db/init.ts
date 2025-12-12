/**
 * Database initialisation for Calo Tracker.
 * Creates tables, indexes, and seeds system food data on first run.
 */

import { getDatabase, persistDatabase, queryOneSQL } from './connection'
import type { SchemaVersion } from './types'

// Schema SQL embedded as string (bundled with app)
const SCHEMA_SQL = `
-- User profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  daily_kcal_goal INTEGER DEFAULT 1800,
  daily_protein_goal INTEGER DEFAULT 75,
  daily_carbs_goal INTEGER DEFAULT 200,
  daily_fat_goal INTEGER DEFAULT 60,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- System food table
CREATE TABLE IF NOT EXISTS system_food (
  id TEXT PRIMARY KEY,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_description TEXT,
  confidence REAL DEFAULT 0.5,
  kcal_s INTEGER NOT NULL,
  protein_s REAL NOT NULL,
  fat_s REAL NOT NULL,
  carbs_s REAL NOT NULL,
  fibre_s REAL,
  sugar_s REAL,
  sodium_s REAL,
  kcal_m INTEGER NOT NULL,
  protein_m REAL NOT NULL,
  fat_m REAL NOT NULL,
  carbs_m REAL NOT NULL,
  fibre_m REAL,
  sugar_m REAL,
  sodium_m REAL,
  kcal_l INTEGER NOT NULL,
  protein_l REAL NOT NULL,
  fat_l REAL NOT NULL,
  carbs_l REAL NOT NULL,
  fibre_l REAL,
  sugar_l REAL,
  sodium_l REAL,
  is_active INTEGER DEFAULT 1
);

-- Custom food table
CREATE TABLE IF NOT EXISTS custom_food (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  protein REAL,
  fat REAL,
  carbs REAL,
  fibre REAL,
  sugar REAL,
  sodium REAL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Food log table
CREATE TABLE IF NOT EXISTS food_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('system', 'custom')),
  food_id TEXT NOT NULL,
  portion TEXT NOT NULL CHECK (portion IN ('S', 'M', 'L', 'single')),
  name_snapshot TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  protein REAL NOT NULL,
  fat REAL NOT NULL,
  carbs REAL NOT NULL,
  logged_date TEXT NOT NULL,
  logged_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Favorite table
CREATE TABLE IF NOT EXISTS favorite (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('system', 'custom')),
  food_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Recent search table
CREATE TABLE IF NOT EXISTS recent_search (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  search_term TEXT NOT NULL,
  searched_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Daily summary table
CREATE TABLE IF NOT EXISTS daily_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_kcal INTEGER DEFAULT 0,
  total_protein REAL DEFAULT 0,
  total_fat REAL DEFAULT 0,
  total_carbs REAL DEFAULT 0,
  log_count INTEGER DEFAULT 0,
  goal_kcal INTEGER,
  goal_protein INTEGER,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  UNIQUE (user_id, date)
);

-- Schema version table
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL,
  description TEXT
);
`

const INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_food_log_deleted ON food_log(deleted_at);
CREATE INDEX IF NOT EXISTS idx_daily_summary_user_date ON daily_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_system_food_category ON system_food(category);
CREATE INDEX IF NOT EXISTS idx_custom_food_user ON custom_food(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON favorite(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_recent_search_user ON recent_search(user_id, searched_at DESC);
`

const CURRENT_SCHEMA_VERSION = 1

/**
 * Checks if database has been initialised with schema.
 */
async function isSchemaInitialised(): Promise<boolean> {
  try {
    const version = await queryOneSQL<SchemaVersion>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    )
    return version !== null
  } catch {
    // Table doesn't exist yet
    return false
  }
}

/**
 * Executes multi-statement SQL by splitting on semicolons.
 * sql.js doesn't support multiple statements in one exec call.
 */
async function execMultipleStatements(sql: string): Promise<void> {
  const db = await getDatabase()

  // Split by semicolon, filter empty statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const statement of statements) {
    db.run(statement)
  }
}

/**
 * Initialises database schema if not already done.
 * Safe to call multiple times (idempotent).
 */
export async function initDatabase(): Promise<void> {
  const isInitialised = await isSchemaInitialised()

  if (isInitialised) {
    // Schema already exists, check for migrations
    await runMigrations()
    return
  }

  // Create fresh schema
  await execMultipleStatements(SCHEMA_SQL)
  await execMultipleStatements(INDEXES_SQL)

  // Record schema version
  const db = await getDatabase()
  db.run(
    'INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)',
    [CURRENT_SCHEMA_VERSION, Date.now(), 'Initial schema with all core tables']
  )

  await persistDatabase()
}

/**
 * Runs any pending database migrations.
 * Migrations are applied in version order.
 */
async function runMigrations(): Promise<void> {
  const currentVersion = await queryOneSQL<SchemaVersion>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  )

  if (!currentVersion) return

  // Add future migrations here as version increases
  // Example:
  // if (currentVersion.version < 2) {
  //   await migrateToV2()
  // }
}

/**
 * Resets database by dropping all data (for testing).
 * Preserves schema structure.
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase()

  // Delete all data from user tables (preserve system_food)
  db.run('DELETE FROM daily_summary')
  db.run('DELETE FROM recent_search')
  db.run('DELETE FROM favorite')
  db.run('DELETE FROM food_log')
  db.run('DELETE FROM custom_food')
  db.run('DELETE FROM user_profile')

  await persistDatabase()
}

/**
 * Gets current schema version.
 */
export async function getSchemaVersion(): Promise<number> {
  const version = await queryOneSQL<SchemaVersion>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  )
  return version?.version ?? 0
}
