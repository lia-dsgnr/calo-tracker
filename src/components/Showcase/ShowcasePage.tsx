/**
 * ShowcasePage - Design system documentation page.
 * 
 * Displays all UI components, design tokens (colors, typography, spacing),
 * and interactive examples for reference during development.
 * 
 * Accessible as a standalone page for design system documentation.
 */

import { useState, useCallback } from 'react'
import { X, PlusCircle, Trash2, Heart } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { IconButton } from '@/components/common/IconButton'
import { Toast } from '@/components/common/Toast'
import { BottomSheet } from '@/components/common/BottomSheet'
import { ProgressRing } from '@/components/Dashboard/ProgressRing'
import { MacroBar } from '@/components/Dashboard/MacroBar'
import { FoodTile } from '@/components/QuickAdd/FoodTile'
import { MealCard } from '@/components/Dashboard/MealCard'
import { cn } from '@/lib/utils'
import type { FoodItem, LogEntry, ToastState, PortionSize } from '@/types'

// Mock data for component demonstrations
const MOCK_FOOD: FoodItem = {
  id: 'showcase-food-1',
  name_vi: 'Phở Bò',
  name_en: 'Beef Pho',
  category: 'noodles',
  portions: {
    S: { kcal: 350, protein: 25, fat: 8, carbs: 45 },
    M: { kcal: 500, protein: 35, fat: 12, carbs: 65 },
    L: { kcal: 650, protein: 45, fat: 16, carbs: 85 },
  },
  serving: '1 bowl (450g)',
  confidence: 0.95,
}

const MOCK_LOG_ENTRY: LogEntry = {
  id: 'showcase-log-1',
  foodId: 'showcase-food-1',
  name_vi: 'Phở Bò',
  portion: 'M',
  kcal: 500,
  protein: 35,
  carbs: 65,
  fat: 12,
  timestamp: Date.now() - 3600000, // 1 hour ago
}

/**
 * Showcase page component displaying all design tokens and UI components.
 */
export function ShowcasePage() {
  // State for interactive component demos
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  })
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [selectedPortion, setSelectedPortion] = useState<PortionSize | null>(null)

  const handleShowToast = useCallback((message: string, variant: ToastState['variant'] = 'success') => {
    setToastState({ visible: true, message, variant })
  }, [])

  const handleCloseToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleOpenBottomSheet = useCallback(() => {
    setBottomSheetOpen(true)
  }, [])

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetOpen(false)
  }, [])

  const handleSelectPortion = useCallback((portion: PortionSize) => {
    setSelectedPortion(portion)
    setBottomSheetOpen(false)
    handleShowToast(`Selected portion: ${portion}`, 'success')
  }, [handleShowToast])

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-6 space-y-12 max-w-4xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-h1 text-foreground mb-2">Design System Showcase</h1>
          <p className="text-body-lg text-foreground-muted">
            Complete reference for all UI components and design tokens
          </p>
        </div>

        {/* Design Tokens Section */}
        <section>
          <h2 className="text-h2 text-foreground mb-6">Design Tokens</h2>

          {/* Color Palette */}
          <div className="space-y-8">
            <div>
              <h3 className="text-h3 text-foreground mb-4">Color Palette</h3>
              
              {/* Primary Colors - using actual hex values from tailwind config */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Mindful Brown</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#F7F4F2' },
                      { shade: 20, color: '#EBDDD9' },
                      { shade: 30, color: '#D6C2B8' },
                      { shade: 40, color: '#C0A091' },
                      { shade: 50, color: '#AC836C' },
                      { shade: 60, color: '#926247' },
                      { shade: 70, color: '#704A33' },
                      { shade: 80, color: '#4F3422' },
                      { shade: 90, color: '#372315' },
                      { shade: 100, color: '#372315' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Optimistic Gray</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#F5F5F5' },
                      { shade: 20, color: '#E1E1E0' },
                      { shade: 30, color: '#C9C7C5' },
                      { shade: 40, color: '#ACA9A5' },
                      { shade: 50, color: '#8A8680' },
                      { shade: 60, color: '#736B66' },
                      { shade: 70, color: '#5A545E' },
                      { shade: 80, color: '#3F3C36' },
                      { shade: 90, color: '#292723' },
                      { shade: 100, color: '#161513' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Serenity Green</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#F2F5EB' },
                      { shade: 20, color: '#E5EAD7' },
                      { shade: 30, color: '#CFD9B5' },
                      { shade: 40, color: '#B4C48D' },
                      { shade: 50, color: '#9BB068' },
                      { shade: 60, color: '#7D944D' },
                      { shade: 70, color: '#5A6B38' },
                      { shade: 80, color: '#3D4A26' },
                      { shade: 90, color: '#29321A' },
                      { shade: 100, color: '#191E10' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Empathy Orange</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#FFEEE2' },
                      { shade: 20, color: '#FFC89E' },
                      { shade: 30, color: '#F6A360' },
                      { shade: 40, color: '#ED7E1C' },
                      { shade: 50, color: '#C96100' },
                      { shade: 60, color: '#AA5500' },
                      { shade: 70, color: '#894700' },
                      { shade: 80, color: '#663600' },
                      { shade: 90, color: '#432500' },
                      { shade: 100, color: '#2E1200' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Zen Yellow</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#FFF4E0' },
                      { shade: 20, color: '#FFF0E0' },
                      { shade: 30, color: '#FFE0C2' },
                      { shade: 40, color: '#FFF0C5' },
                      { shade: 50, color: '#FFBD1A' },
                      { shade: 60, color: '#E0A500' },
                      { shade: 70, color: '#A37A00' },
                      { shade: 80, color: '#705600' },
                      { shade: 90, color: '#4D3C00' },
                      { shade: 100, color: '#2E2500' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-body font-medium text-foreground mb-3">Kind Purple</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { shade: 10, color: '#F6F1FF' },
                      { shade: 20, color: '#DDD1FF' },
                      { shade: 30, color: '#C2B1FF' },
                      { shade: 40, color: '#A694F5' },
                      { shade: 50, color: '#8978E3' },
                      { shade: 60, color: '#6C5FC8' },
                      { shade: 70, color: '#5349A5' },
                      { shade: 80, color: '#3C357C' },
                      { shade: 90, color: '#292350' },
                      { shade: 100, color: '#161324' },
                    ].map(({ shade, color }) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className={cn('h-16 rounded-card shadow-tile')}
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-caption text-foreground-muted text-center">
                          {shade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="mt-6 space-y-3">
                <h4 className="text-body font-medium text-foreground mb-3">Semantic Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-12 bg-primary rounded-card" />
                    <p className="text-caption text-foreground-muted">Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-secondary rounded-card" />
                    <p className="text-caption text-foreground-muted">Secondary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-success rounded-card" />
                    <p className="text-caption text-foreground-muted">Success</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-warning rounded-card" />
                    <p className="text-caption text-foreground-muted">Warning</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-error rounded-card" />
                    <p className="text-caption text-foreground-muted">Error</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-background-card border border-border rounded-card" />
                    <p className="text-caption text-foreground-muted">Card Background</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-foreground rounded-card" />
                    <p className="text-caption text-foreground-muted">Foreground</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 bg-border rounded-card" />
                    <p className="text-caption text-foreground-muted">Border</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">Typography</h3>
              <div className="space-y-4 bg-background-card rounded-card shadow-card p-6">
                <div>
                  <p className="text-caption text-foreground-muted mb-1">H1 / Headline</p>
                  <p className="text-h1 text-foreground">The quick brown fox jumps</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">H2</p>
                  <p className="text-h2 text-foreground">The quick brown fox jumps</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">H3</p>
                  <p className="text-h3 text-foreground">The quick brown fox jumps</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">Body Large</p>
                  <p className="text-body-lg text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">Body</p>
                  <p className="text-body text-foreground">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">Caption</p>
                  <p className="text-caption text-foreground-muted">The quick brown fox jumps over the lazy dog</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">Numeric Large</p>
                  <p className="text-numeric-lg text-foreground">1,234</p>
                </div>
                <div>
                  <p className="text-caption text-foreground-muted mb-1">Numeric</p>
                  <p className="text-numeric text-foreground">1,234</p>
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">Border Radius</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-card" />
                  <p className="text-caption text-foreground-muted">Card (20px)</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-sheet" />
                  <p className="text-caption text-foreground-muted">Sheet (24px)</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-pill" />
                  <p className="text-caption text-foreground-muted">Pill (9999px)</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-chip" />
                  <p className="text-caption text-foreground-muted">Chip (12px)</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-input" />
                  <p className="text-caption text-foreground-muted">Input (16px)</p>
                </div>
              </div>
            </div>

            {/* Shadows */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">Shadows</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-24 bg-background-card rounded-card shadow-card" />
                  <p className="text-caption text-foreground-muted">Card Shadow</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-background-card rounded-card shadow-sheet" />
                  <p className="text-caption text-foreground-muted">Sheet Shadow</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-background-card rounded-card shadow-tile" />
                  <p className="text-caption text-foreground-muted">Tile Shadow</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UI Components Section */}
        <section>
          <h2 className="text-h2 text-foreground mb-6">UI Components</h2>

          <div className="space-y-8">
            {/* Card Variants */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="default">
                  <p className="text-body text-foreground">Default Card</p>
                  <p className="text-caption text-foreground-muted mt-2">
                    Static card with background and shadow
                  </p>
                </Card>
                <Card variant="interactive" onPress={() => handleShowToast('Interactive card clicked', 'success')}>
                  <p className="text-body text-foreground">Interactive Card</p>
                  <p className="text-caption text-foreground-muted mt-2">
                    Clickable card with hover states
                  </p>
                </Card>
                <Card variant="expandable" isExpanded={false} onPress={() => handleShowToast('Expandable card clicked', 'success')}>
                  <p className="text-body text-foreground">Expandable Card</p>
                  <p className="text-caption text-foreground-muted mt-2">
                    Card that can expand/collapse
                  </p>
                </Card>
              </div>
            </div>

            {/* IconButton Variants */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">IconButton</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <IconButton
                    icon={<X size={20} />}
                    onClick={() => handleShowToast('Default icon button clicked', 'success')}
                    aria-label="Close"
                    variant="default"
                  />
                  <IconButton
                    icon={<PlusCircle size={20} />}
                    onClick={() => handleShowToast('Primary icon button clicked', 'success')}
                    aria-label="Add"
                    variant="primary"
                  />
                  <IconButton
                    icon={<Trash2 size={20} />}
                    onClick={() => handleShowToast('Danger icon button clicked', 'success')}
                    aria-label="Delete"
                    variant="danger"
                  />
                  <IconButton
                    icon={<Heart size={20} />}
                    onClick={() => handleShowToast('Ghost icon button clicked', 'success')}
                    aria-label="Favorite"
                    variant="ghost"
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <IconButton
                    icon={<X size={16} />}
                    onClick={() => {}}
                    aria-label="Small"
                    size="sm"
                  />
                  <IconButton
                    icon={<X size={20} />}
                    onClick={() => {}}
                    aria-label="Medium"
                    size="md"
                  />
                  <IconButton
                    icon={<X size={24} />}
                    onClick={() => {}}
                    aria-label="Large"
                    size="lg"
                  />
                </div>
              </div>
            </div>

            {/* ProgressRing */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">ProgressRing</h3>
              <div className="flex flex-wrap gap-8">
                <div className="space-y-2">
                  <ProgressRing consumed={1200} goal={2000} />
                  <p className="text-caption text-foreground-muted text-center">60% Progress</p>
                </div>
                <div className="space-y-2">
                  <ProgressRing consumed={2000} goal={2000} />
                  <p className="text-caption text-foreground-muted text-center">100% Progress</p>
                </div>
                <div className="space-y-2">
                  <ProgressRing consumed={2500} goal={2000} />
                  <p className="text-caption text-foreground-muted text-center">Exceeded Goal</p>
                </div>
              </div>
            </div>

            {/* MacroBar */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">MacroBar</h3>
              <div className="space-y-4 max-w-md">
                <MacroBar label="Protein" consumed={120} goal={150} unit="g" colorClass="bg-primary" />
                <MacroBar label="Carbs" consumed={180} goal={200} unit="g" colorClass="bg-secondary" />
                <MacroBar label="Fat" consumed={45} goal={65} unit="g" colorClass="bg-warning" />
                <MacroBar label="No Goal" consumed={50} unit="g" colorClass="bg-tertiary" />
              </div>
            </div>

            {/* FoodTile */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">FoodTile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <FoodTile
                  food={MOCK_FOOD}
                  onSelect={() => handleOpenBottomSheet()}
                />
                <FoodTile
                  food={{ ...MOCK_FOOD, name_vi: 'Bánh Mì Thịt Nướng', id: 'showcase-food-2' }}
                  onSelect={() => handleOpenBottomSheet()}
                />
              </div>
            </div>

            {/* MealCard */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">MealCard</h3>
              <div className="space-y-3 max-w-md">
                <MealCard
                  entry={MOCK_LOG_ENTRY}
                  onDelete={() => handleShowToast('Meal deleted', 'success')}
                />
                <MealCard
                  entry={{
                    ...MOCK_LOG_ENTRY,
                    id: 'showcase-log-2',
                    name_vi: 'Bánh Mì Thịt Nướng',
                    portion: 'L',
                    kcal: 650,
                    timestamp: Date.now() - 7200000,
                  }}
                  onDelete={() => handleShowToast('Meal deleted', 'success')}
                />
              </div>
            </div>

            {/* Toast Demo */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">Toast</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleShowToast('Success message', 'success')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-pill text-body"
                >
                  Show Success Toast
                </button>
                <button
                  type="button"
                  onClick={() => handleShowToast('Error message', 'error')}
                  className="px-4 py-2 bg-error text-white rounded-pill text-body"
                >
                  Show Error Toast
                </button>
              </div>
            </div>

            {/* BottomSheet Demo */}
            <div>
              <h3 className="text-h3 text-foreground mb-4">BottomSheet</h3>
              <button
                type="button"
                onClick={handleOpenBottomSheet}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-pill text-body"
              >
                Open BottomSheet
              </button>
              {selectedPortion && (
                <p className="text-body text-foreground-muted mt-2">
                  Last selected portion: {selectedPortion}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Toast Component */}
      <Toast
        toast={toastState}
        onClose={handleCloseToast}
        onUndo={() => handleShowToast('Undo action triggered', 'success')}
      />

      {/* BottomSheet Component */}
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={handleCloseBottomSheet}
        title="Select Portion Size"
        description="Choose a portion size for demonstration"
        size="auto"
        showDragHandle={true}
      >
        <div className="flex gap-3 justify-center">
          {(['S', 'M', 'L'] as PortionSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleSelectPortion(size)}
              className={cn(
                'flex-1 max-w-[140px] py-4 px-4',
                'rounded-pill bg-primary text-primary-foreground',
                'transition-all duration-150',
                'hover:bg-primary-dark active:scale-95',
                'min-h-[72px] tap-highlight-none'
              )}
            >
              <span className="block text-xl font-bold mb-1">{size}</span>
              <span className="block text-caption opacity-90">
                {MOCK_FOOD.portions[size].kcal} kcal
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
