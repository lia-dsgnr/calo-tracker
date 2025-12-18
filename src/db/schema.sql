-- Calo Tracker SQLite Schema
-- Version: 1.0.0
-- Optimised for 10 local accounts, local-first architecture

-- User profile table: stores user preferences and goals
-- Supports multiple local accounts (max 10 for testing)
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

-- System food table: curated Vietnamese food database
-- Replaces the static foods.json file
CREATE TABLE IF NOT EXISTS system_food (
  id TEXT PRIMARY KEY,
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_description TEXT,
  confidence REAL DEFAULT 0.5,
  -- Small portion nutrients
  kcal_s INTEGER NOT NULL,
  protein_s REAL NOT NULL,
  fat_s REAL NOT NULL,
  carbs_s REAL NOT NULL,
  fibre_s REAL,
  sugar_s REAL,
  sodium_s REAL,
  -- Medium portion nutrients
  kcal_m INTEGER NOT NULL,
  protein_m REAL NOT NULL,
  fat_m REAL NOT NULL,
  carbs_m REAL NOT NULL,
  fibre_m REAL,
  sugar_m REAL,
  sodium_m REAL,
  -- Large portion nutrients
  kcal_l INTEGER NOT NULL,
  protein_l REAL NOT NULL,
  fat_l REAL NOT NULL,
  carbs_l REAL NOT NULL,
  fibre_l REAL,
  sugar_l REAL,
  sodium_l REAL,
  -- Visibility flag for soft-hiding foods
  is_active INTEGER DEFAULT 1
);

-- Custom food table: user-created foods (max 30 per user)
-- Single portion only (no S/M/L variants)
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

-- Food log table: individual meal entries
-- Core logging functionality with 30-day retention
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

-- Favorite table: user's favorite foods (max 20 per user)
-- Supports both system and custom foods
CREATE TABLE IF NOT EXISTS favorite (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('system', 'custom')),
  food_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  default_portion TEXT DEFAULT 'M',
  use_count INTEGER DEFAULT 0,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Recent search table: last 5 search terms per user
-- FIFO: oldest entries removed when limit exceeded
CREATE TABLE IF NOT EXISTS recent_search (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  search_term TEXT NOT NULL,
  searched_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Daily summary table: cached aggregates for fast stats
-- Hybrid approach: raw logs + pre-computed summaries
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

-- Meal template table: reusable multi-item meal definitions
CREATE TABLE IF NOT EXISTS meal_template (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_kcal INTEGER NOT NULL,
  total_protein REAL NOT NULL,
  total_fat REAL NOT NULL,
  total_carbs REAL NOT NULL,
  use_count INTEGER DEFAULT 0,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
);

-- Template items: individual foods within a template
CREATE TABLE IF NOT EXISTS template_item (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('system', 'custom')),
  food_id TEXT NOT NULL,
  portion TEXT NOT NULL CHECK (portion IN ('S', 'M', 'L', 'single')),
  name_snapshot TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  protein REAL NOT NULL,
  fat REAL NOT NULL,
  carbs REAL NOT NULL,
  is_required INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES meal_template(id) ON DELETE CASCADE
);

-- Schema metadata for versioning and migrations
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL,
  description TEXT
);

-- Insert initial schema version
INSERT OR IGNORE INTO schema_version (version, applied_at, description)
VALUES (1, strftime('%s', 'now') * 1000, 'Initial schema with all core tables');
