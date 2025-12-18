-- Calo Tracker SQLite Indexes
-- Optimised for common query patterns

-- Food log queries: filter by user and date range
CREATE INDEX IF NOT EXISTS idx_food_log_user_date 
ON food_log(user_id, logged_date);

-- Soft delete filtering: exclude deleted records
CREATE INDEX IF NOT EXISTS idx_food_log_deleted 
ON food_log(deleted_at);

-- Daily summary lookups: user's stats by date
CREATE INDEX IF NOT EXISTS idx_daily_summary_user_date 
ON daily_summary(user_id, date);

-- System food browsing: filter by category
CREATE INDEX IF NOT EXISTS idx_system_food_category 
ON system_food(category);

-- Custom food queries: user's custom foods excluding deleted
CREATE INDEX IF NOT EXISTS idx_custom_food_user 
ON custom_food(user_id, deleted_at);

-- Favorite queries: user's favorites excluding deleted
CREATE INDEX IF NOT EXISTS idx_favorite_user 
ON favorite(user_id, deleted_at);

-- Recent search: user's search history ordered by time
CREATE INDEX IF NOT EXISTS idx_recent_search_user 
ON recent_search(user_id, searched_at DESC);

-- Meal template queries: filter by user and exclude deleted
CREATE INDEX IF NOT EXISTS idx_meal_template_user 
ON meal_template(user_id, deleted_at);

-- Template item lookups: find items by template
CREATE INDEX IF NOT EXISTS idx_template_item_template 
ON template_item(template_id);

-- Favorites frequency calculation: optimise log queries by user, food, and date
CREATE INDEX IF NOT EXISTS idx_food_log_user_food_date 
ON food_log(user_id, food_id, logged_date);
