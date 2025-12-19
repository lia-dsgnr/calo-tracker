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
    return (
      // Shell container keeps the main experience at a stable width
      // regardless of global body styles (e.g. when modals lock scroll).
      <div className="max-w-[1000px] mx-auto">
        <ShowcasePage />
      </div>
    )
  }

  return (
    // Shell container keeps the main Quick Add UI pinned to 1000px width,
    // so opening bottom sheets cannot visually shrink the dashboard behind.
    <div className="max-w-[1000px] mx-auto">
      <QuickAddPage />
    </div>
  )
}

export default App
