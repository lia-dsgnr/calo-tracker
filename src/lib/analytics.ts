/**
 * Analytics event tracking for Calo Tracker.
 * Tracks user interactions and feature usage for product insights.
 * 
 * Events are logged to console in development and can be extended
 * to send to analytics services (e.g., Google Analytics, Mixpanel) in production.
 */

/**
 * Analytics event names matching the plan specification.
 */
export type AnalyticsEvent =
  | 'favorite_added'
  | 'favorite_removed'
  | 'favorite_logged'
  | 'favorite_reordered'
  | 'suggestion_favorited'
  | 'timeline_log_again'
  | 'timeline_scrolled'
  | 'template_created'
  | 'template_logged'
  | 'template_edited'
  | 'template_deleted'
  | 'quickadd_section_visible'
  | 'quickadd_favorite_removed'
  | 'quickadd_favorites_removed_all'
  | 'quickadd_suggestions_hidden'
  | 'quickadd_suggestion_hidden'
  | 'search_food_selected'

/**
 * Event parameters for each event type.
 */
export interface AnalyticsParams {
  favorite_added: {
    food_id: string
    food_type: 'system' | 'custom'
    source: 'tile' | 'search' | 'timeline'
  }
  favorite_removed: {
    food_id: string
    food_type: 'system' | 'custom'
  }
  favorite_logged: {
    food_id: string
    portion: 'S' | 'M' | 'L' | 'single'
    method: 'tap' | 'quick_log'
  }
  favorite_reordered: {
    from_position: number
    to_position: number
  }
  suggestion_favorited: {
    food_id: string
    category: string
  }
  timeline_log_again: {
    food_id: string
    days_ago: number
  }
  timeline_scrolled: {
    depth_days: number
  }
  template_created: {
    item_count: number
    total_kcal: number
  }
  template_logged: {
    template_id: string
    items_logged: number
    items_skipped: number
  }
  template_edited: {
    template_id: string
    change_type: 'name' | 'description' | 'items'
  }
  template_deleted: {
    template_id: string
  }
  quickadd_section_visible: {
    section: 'favorites' | 'timeline' | 'templates'
  }
  quickadd_favorite_removed: {
    food_id: string
  }
  quickadd_favorites_removed_all: {
    count: number
  }
  quickadd_suggestions_hidden: Record<string, never>
  quickadd_suggestion_hidden: {
    food_id: string
  }
  search_food_selected: {
    food_id: string
    query: string
  }
}

/**
 * Tracks an analytics event with parameters.
 * In development, logs to console. In production, can be extended to send to analytics service.
 */
export function trackEvent<T extends AnalyticsEvent>(
  event: T,
  params: AnalyticsParams[T]
): void {
  // Development: log to console for debugging
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event, params)
  }

  // Production: extend to send to analytics service
  // Example:
  // if (import.meta.env.PROD) {
  //   gtag('event', event, params)
  //   // or
  //   mixpanel.track(event, params)
  // }
}

/**
 * Helper to calculate days ago from a timestamp.
 */
export function calculateDaysAgo(timestamp: number): number {
  const now = Date.now()
  const diffMs = now - timestamp
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
