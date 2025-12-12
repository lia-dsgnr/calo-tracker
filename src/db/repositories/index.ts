/**
 * Repository exports for Calo Tracker database.
 * Provides data access layer for all entities.
 */

// User operations
export {
  createUser,
  getUserById,
  getAllUsers,
  getDefaultUser,
  updateUser,
  deleteUser,
  getUserCount,
} from './user-repository'

// Food operations (system + custom)
export {
  // System foods
  getAllSystemFoods,
  getSystemFoodsByCategory,
  getSystemFoodById,
  searchSystemFoods,
  getSystemFoodNutrition,
  // Custom foods
  createCustomFood,
  getCustomFoodById,
  getCustomFoodsByUser,
  updateCustomFood,
  deleteCustomFood,
  getCustomFoodCount,
  searchCustomFoods,
} from './food-repository'

// Log operations
export {
  createLog,
  getLogById,
  getLogsForDate,
  getTodayLogs,
  getLogsForDateRange,
  getRecentLogs,
  deleteLog,
  restoreLog,
  getLogCountForDate,
  pruneOldLogs,
  getMostLoggedFoods,
} from './log-repository'

// Favorite operations
export {
  addFavorite,
  getFavoriteById,
  getFavorite,
  getFavoritesByUser,
  isFavorited,
  removeFavorite,
  removeFavoriteById,
  updateFavoriteOrder,
  getFavoriteCount,
  toggleFavorite,
} from './favorite-repository'

// Search operations
export {
  addRecentSearch,
  getRecentSearches,
  deleteRecentSearch,
  clearRecentSearches,
  getRecentSearchCount,
} from './search-repository'

// Statistics operations
export {
  getDailySummary,
  getTodaySummary,
  getSummariesForRange,
  getWeeklySummary,
  getMonthlySummary,
  getTrendData,
  pruneOldSummaries,
  getStreak,
} from './stats-repository'
