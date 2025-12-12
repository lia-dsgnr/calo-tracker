---
name: Database Schema Design
overview: Design a SQLite database schema for Calo Tracker that supports user profiles, food logging with history, custom foods, favorites, and statistics - built local-first with future cloud sync capability.
todos:
  - id: review-schema
    content: Review schema design with stakeholder before implementation
    status: completed
  - id: create-migrations
    content: Create SQLite migration scripts
    status: completed
  - id: migrate-localstorage
    content: Build migration utility from localStorage to SQLite
    status: completed
  - id: implement-dal
    content: Implement data access layer (repositories/hooks)
    status: completed
---

# Database Schema Design for Calo Tracker

## Design Principles

- **Local-first**: SQLite (sql.js WASM) for browser-based storage
- **Test-scoped**: Optimised for 10 accounts max
- **Simplified sync**: UUIDs for IDs, soft deletes (sync-ready but not required)
- **Hybrid stats**: Raw logs + daily aggregates cached
- **Lean nutrients**: Core macros + fibre, sugar, sodium

---

## Tables

### 1. `user_profile`

Single row for local user; supports future multi-user sync.

| Column | Type | Notes |

|--------|------|-------|

| id | TEXT (UUID) | Primary key, sync-friendly |

| display_name | TEXT | Optional nickname |

| daily_kcal_goal | INTEGER | Default 1800 |

| daily_protein_goal | INTEGER | Default 75 |

| daily_carbs_goal | INTEGER | Default 200 |

| daily_fat_goal | INTEGER | Default 60 |

| created_at | INTEGER | Unix timestamp |

| updated_at | INTEGER | For sync conflict resolution |

### 2. `system_food`

Curated Vietnamese food database (replaces `foods.json`).

| Column | Type | Notes |

|--------|------|-------|

| id | TEXT | Slug ID (e.g., `pho-bo-tai`) |

| name_vi | TEXT | Vietnamese name |

| name_en | TEXT | English name |

| category | TEXT | `noodles`, `rice`, etc. |

| serving_description | TEXT | e.g., "1 bowl (450g)" |

| confidence | REAL | Data confidence 0-1 |

| kcal_s / kcal_m / kcal_l | INTEGER | Calories per portion |

| protein_s / protein_m / protein_l | REAL | Protein (g) |

| fat_s / fat_m / fat_l | REAL | Fat (g) |

| carbs_s / carbs_m / carbs_l | REAL | Carbs (g) |

| fibre_s / fibre_m / fibre_l | REAL | Fibre (g) - nullable |

| sugar_s / sugar_m / sugar_l | REAL | Sugar (g) - nullable |

| sodium_s / sodium_m / sodium_l | REAL | Sodium (mg) - nullable |

| is_active | INTEGER | 1=visible, 0=hidden |

### 3. `custom_food`

User-created foods (max 30 per user, no S/M/L portions).

| Column | Type | Notes |

|--------|------|-------|

| id | TEXT (UUID) | Primary key |

| user_id | TEXT | FK to user_profile |

| name | TEXT | User-defined name |

| kcal | INTEGER | Required |

| protein | REAL | Optional |

| fat | REAL | Optional |

| carbs | REAL | Optional |

| fibre | REAL | Optional |

| sugar | REAL | Optional |

| sodium | REAL | Optional |

| created_at | INTEGER | Unix timestamp |

| updated_at | INTEGER | For sync |

| deleted_at | INTEGER | Soft delete for sync |

### 4. `food_log`

Individual meal entries (core of the app).

| Column | Type | Notes |

|--------|------|-------|

| id | TEXT (UUID) | Primary key |

| user_id | TEXT | FK to user_profile |

| food_type | TEXT | `system` or `custom` |

| food_id | TEXT | FK to system_food or custom_food |

| portion | TEXT | `S`, `M`, `L`, or `single` (custom) |

| name_snapshot | TEXT | Denormalised for display |

| kcal | INTEGER | Logged value (snapshot) |

| protein | REAL | Snapshot |

| fat | REAL | Snapshot |

| carbs | REAL | Snapshot |

| logged_date | TEXT | `YYYY-MM-DD` (local) for queries |

| logged_at | INTEGER | Unix timestamp |

| deleted_at | INTEGER | Soft delete for undo/sync |

**Constraint**: Max 30 items per day enforced at app level.

### 5. `favorite`

User's favorite foods (max 20).

| Column | Type | Notes |

|--------|------|-------|

| id | TEXT (UUID) | Primary key |

| user_id | TEXT | FK to user_profile |

| food_type | TEXT | `system` or `custom` |

| food_id | TEXT | FK to system_food or custom_food |

| sort_order | INTEGER | For manual reordering |

| created_at | INTEGER | Unix timestamp |

| deleted_at | INTEGER | Soft delete |

### 6. `recent_search`

Last 5 search terms (per scope doc).

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER | Auto-increment |

| user_id | TEXT | FK to user_profile |

| search_term | TEXT | What user typed |

| searched_at | INTEGER | Unix timestamp |

### 7. `daily_summary` (cached aggregates)

Pre-computed daily totals for fast dashboard/stats.

| Column | Type | Notes |

|--------|------|-------|

| id | INTEGER | Auto-increment |

| user_id | TEXT | FK to user_profile |

| date | TEXT | `YYYY-MM-DD` |

| total_kcal | INTEGER | Sum of day's logs |

| total_protein | REAL | |

| total_fat | REAL | |

| total_carbs | REAL | |

| log_count | INTEGER | Number of entries |

| goal_kcal | INTEGER | Snapshot of goal that day |

| goal_protein | INTEGER | Snapshot |

| updated_at | INTEGER | Last recalculation |

**UNIQUE** constraint on `(user_id, date)`.

---

## Key Indexes

```sql
CREATE INDEX idx_food_log_user_date ON food_log(user_id, logged_date);
CREATE INDEX idx_food_log_deleted ON food_log(deleted_at);
CREATE INDEX idx_daily_summary_user_date ON daily_summary(user_id, date);
CREATE INDEX idx_system_food_category ON system_food(category);
CREATE INDEX idx_custom_food_user ON custom_food(user_id, deleted_at);
CREATE INDEX idx_favorite_user ON favorite(user_id, deleted_at);
```

---

## Statistics Query Examples

**Weekly summary** (from cached daily_summary):

```sql
SELECT 
  SUM(total_kcal) as week_kcal,
  AVG(total_kcal) as avg_daily_kcal,
  SUM(log_count) as total_logs
FROM daily_summary
WHERE user_id = ? 
  AND date BETWEEN date('now', '-7 days') AND date('now');
```

**Monthly trend** (for charts):

```sql
SELECT date, total_kcal, goal_kcal
FROM daily_summary
WHERE user_id = ? AND date >= date('now', '-30 days')
ORDER BY date;
```

---

## Data Retention

- `food_log`: Retain 30 days (per spec), prune older via `logged_date`
- `daily_summary`: Retain 90 days for monthly reports
- `recent_search`: Keep only last 5 per user (FIFO)
- Soft deletes: Purge `deleted_at` records after 7 days

---

## Migration Path from localStorage

1. Create SQLite DB on first launch
2. Import existing `calo_logs` → `food_log` table
3. Import `calo_recent` → derive from `food_log` (most recent 8)
4. Import `calo_goals` → `user_profile` row
5. Generate `daily_summary` for existing log dates
6. Keep localStorage as backup during migration period

---

## Storage Capacity Limits

| Resource | Limit | Enforcement |

|----------|-------|-------------|

| Database file | 10 MB max | Monitor file size |

| `food_log` retention | 30 days | Prune on app init |

| `daily_summary` retention | 90 days | Prune on app init |

| `custom_food` per user | 30 | App-level validation |

| `favorite` per user | 20 | App-level validation |

| `recent_search` | 5 | FIFO on insert |

| `system_food` catalog | 500 | Admin constraint |

| **Local user accounts** | 10 max | App-level validation |

### Per-User Storage

| Component | Size |

|-----------|------|

| User data (logs, favorites, custom foods) | ~350 KB |

| Shared system foods + overhead | ~250 KB (fixed) |

| **Single user total** | **~600 KB** |

### Multi-User Capacity

| Users | Total Storage | Status |

|-------|---------------|--------|

| 1 | 600 KB | ✅ Comfortable |

| 5 | 2 MB | ✅ Comfortable |

| 10 | 3.75 MB | ✅ Recommended max |

| 20+ | 7+ MB | ⚠️ Consider cloud sync

---

## Dependencies

```json
{
  "dependencies": {
    "sql.js": "^1.10.0",
    "uuid": "^9.0.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/sql.js": "^1.4.0"
  }
}
```

| Package | Purpose |

|---------|---------|

| `sql.js` | SQLite compiled to WASM for browser |

| `uuid` | Generate sync-friendly UUIDs for PKs |

| `date-fns` | Date manipulation for queries |

### sql.js Setup Notes

- Load WASM file from CDN or bundle locally
- DB persists to IndexedDB (not localStorage - larger quota)
- Async init required: `await initSqlJs({ locateFile: ... })`

---

## Future Sync Considerations

- All primary keys are UUIDs (no auto-increment conflicts)
- `updated_at` on mutable tables for last-write-wins
- `deleted_at` soft deletes allow sync before purge
- `user_id` ready for multi-account when cloud sync added