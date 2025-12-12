
// Data Dependencies Diagram
Data: {
  SystemFoodDB: "system_food table"
  CustomFoodDB: "custom_food table"
  FoodLogDB: "food_log table"
  RecentSearchDB: "recent_search table"
  FavoritesDB: "favorite table"
}

// Flow 1 Dependencies
Search.Start -> RecentSearchDB: "Load last 5 terms"
Search.Empty -> FavoritesDB: "Fetch favourites list"
Search.Empty -> SystemFoodDB: "Fetch popular foods"

// Flow 2 Dependencies
Typing.QueryDB -> SystemFoodDB: "Search by name, alt names"
Typing.QueryDB -> CustomFoodDB: "Search custom foods"
Typing.NoResults -> CustomFoodDB: "Check duplicates before allowing Add Custom"

// Flow 3 Dependencies
SelectResult.HasPortions -> SystemFoodDB: "Get portion sizes"
SelectResult.InstantAdd -> SystemFoodDB: "Fetch base calories/macros"
SelectResult.LogEntry -> FoodLogDB: "Insert log entry"
SelectResult.UndoAction -> FoodLogDB: "Delete log entry"

// Flow 4 Dependencies
CustomFood.Save -> CustomFoodDB: "Insert custom food record"
CustomFood.Validate -> CustomFoodDB: "Check name duplicates"
CustomFood.AddLog -> FoodLogDB: "Insert log entry with custom food reference"

// Cross-cutting dependencies
Typing.UserTypes -> RecentSearchDB: "Save search term (FIFO)"
SelectResult -> FavoritesDB: "Toggle favourite state"

