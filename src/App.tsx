/**
 * App - Root component for Calo Tracker.
 * Uses QuickAddPage which includes Dashboard, Favorites, Templates, Timeline, and food browsing.
 */

import { QuickAddPage } from '@/components/QuickAdd'
import { ShowcasePage } from '@/components/Showcase'

// Check URL parameter to show showcase page
const SHOW_SHOWCASE = new URLSearchParams(window.location.search).has('showcase')

function App() {
  // Show showcase page if URL parameter is set
  if (SHOW_SHOWCASE) {
    return <ShowcasePage />
  }

  return <QuickAddPage />
}

export default App
