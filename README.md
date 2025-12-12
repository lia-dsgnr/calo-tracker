# Calo Tracker

A Vietnamese-first calorie tracking web app designed for speed and simplicity. Log meals in under 3 seconds with a curated database of Vietnamese foods.

## Features

- **Quick Add** — One-tap food logging with S/M/L portion sizes
- **Vietnamese Food Database** — 50+ curated local foods with accurate nutrition data
- **Daily Progress** — Visual calorie ring and macro tracking (protein, carbs, fat)
- **Offline-First** — SQLite database runs entirely in-browser via WebAssembly
- **Data Persistence** — Automatic sync to IndexedDB for reliable storage

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 3.4 |
| Database | sql.js (SQLite WASM) + IndexedDB |
| Icons | Lucide React |
| Utilities | date-fns, uuid, clsx, tailwind-merge |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/lia-dsgnr/calo-tracker.git
cd calo-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── Dashboard/    # Progress ring, macro bars, meal history
│   ├── QuickAdd/     # Food tiles, portion picker
│   └── common/       # Shared UI components
├── contexts/         # React context providers
├── db/               # SQLite database layer
│   ├── repositories/ # Data access layer (CRUD operations)
│   ├── connection.ts # sql.js connection manager
│   ├── init.ts       # Schema creation & migrations
│   └── seed.ts       # System food seeding
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── types/            # TypeScript type definitions
└── data/             # Static data (foods.json)
```

## Database Schema

7 tables supporting multi-user calorie tracking:

- `user_profile` — User accounts and daily goals
- `system_food` — Curated Vietnamese food database
- `custom_food` — User-created foods
- `food_log` — Meal entries with timestamps
- `favorite` — User favorites for quick access
- `recent_search` — Search history
- `daily_summary` — Pre-computed daily aggregates

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Documentation

- [CHANGELOG](docs/CHANGELOG.md) — Version history and updates
- [Naming Conventions](docs/guides/naming-conventions.md) — File naming standards

## License

Private project — All rights reserved.
