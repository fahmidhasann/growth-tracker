# Growth Tracker — Project Reference

> **Purpose of this file:** Provide full project context to AI coding assistants at the start of any new session. Include this file in the conversation context when asking for new features, bug fixes, or refactors.

---

## Overview

**Growth Tracker** is a personal learning and growth tracking single-page application (SPA). It lets a user log their learning journey—what they learned, what they built, what challenges they faced—and track skills, projects, and milestones over time. The app features a dark-themed, modern UI with charts, a GitHub-style activity heatmap, and a timeline of achievements.

The project was bootstrapped via **Google AI Studio** and uses the **Gemini API key** (configured in `.env.local`), though the current codebase does not actively call the Gemini API in any component — the integration is wired in the Vite config for potential future use.

---

## Tech Stack

| Layer              | Technology                                                                 |
|--------------------|---------------------------------------------------------------------------|
| **Framework**      | React 19 (with TypeScript)                                               |
| **Build Tool**     | Vite 6                                                                    |
| **Styling**        | Tailwind CSS v4 (via `@tailwindcss/vite` plugin)                         |
| **State Mgmt**     | Zustand 5 (with `persist` middleware → `localStorage`)                   |
| **Charts**         | Recharts 3 (BarChart, LineChart)                                         |
| **Icons**          | Lucide React                                                              |
| **Date Utilities** | date-fns                                                                  |
| **Animations**     | Motion (Framer Motion successor) — imported but CSS `animate-in` is used |
| **Utilities**      | clsx + tailwind-merge (via `cn()` helper)                                |
| **Fonts**          | Inter (sans) + JetBrains Mono (mono), loaded from Google Fonts           |

### Unused / Available Dependencies (installed but not actively used yet)

- `@google/genai` — Gemini AI SDK, key injected via Vite `define` as `process.env.GEMINI_API_KEY`
- `better-sqlite3` / `express` / `dotenv` — Backend dependencies (no backend server code exists yet)

---

## Project Structure

```
growth-tracker/
├── index.html                 # HTML entry point
├── metadata.json              # AI Studio app metadata
├── package.json
├── tsconfig.json              # TS config (ES2022, bundler resolution, path alias @/*)
├── vite.config.ts             # Vite config (React, Tailwind, Gemini key injection)
├── src/
│   ├── main.tsx               # React DOM entry — renders <App /> into #root
│   ├── App.tsx                # Root component — tab-based routing via useState
│   ├── index.css              # Global styles — Tailwind import, font config
│   ├── components/
│   │   ├── Layout.tsx         # App shell — sidebar (desktop) + bottom nav (mobile) + cn() utility
│   │   └── Heatmap.tsx        # GitHub-style 365-day activity heatmap component
│   ├── pages/
│   │   ├── Dashboard.tsx      # Summary cards, heatmap, skill bar chart, mood line chart, milestone timeline
│   │   ├── Logs.tsx           # CRUD for learning log entries (modal form)
│   │   ├── Skills.tsx         # CRUD for skills with level tracking (1-5 scale)
│   │   ├── Projects.tsx       # CRUD for projects with status toggle (ongoing/completed)
│   │   └── Milestones.tsx     # CRUD for milestones with timeline display
│   ├── store/
│   │   └── useStore.ts        # Zustand store — all state + actions, persisted to localStorage
│   └── types/
│       └── index.ts           # TypeScript type definitions for all data models
```

---

## Data Models (`src/types/index.ts`)

### LogEntry
| Field        | Type     | Notes                                        |
|-------------|----------|----------------------------------------------|
| `id`        | `string` | Auto-generated UUID                          |
| `date`      | `string` | ISO date string                              |
| `learned`   | `string` | Free text — what the user learned            |
| `built`     | `string` | Free text — what the user built              |
| `challenges`| `string` | Free text — challenges faced                 |
| `mood`      | `number` | 1–5 scale (😫 😕 😐 🙂 🤩)                  |

### Skill
| Field     | Type                                  | Notes                                  |
|-----------|---------------------------------------|----------------------------------------|
| `id`      | `string`                              | Auto-generated UUID                    |
| `name`    | `string`                              | Skill name (e.g. "Python")             |
| `level`   | `number`                              | 1–5 (Beginner → Expert)               |
| `history` | `{ date: string; level: number }[]`   | Tracks level changes over time         |

### Project
| Field         | Type                          | Notes                       |
|--------------|-------------------------------|-----------------------------|
| `id`         | `string`                      | Auto-generated UUID         |
| `title`      | `string`                      | Project name                |
| `description`| `string`                      | What was built & tech used  |
| `date`       | `string`                      | ISO date string             |
| `status`     | `'ongoing' \| 'completed'`    | Toggleable                  |

### Milestone
| Field         | Type               | Notes                           |
|--------------|--------------------|---------------------------------|
| `id`         | `string`           | Auto-generated UUID             |
| `title`      | `string`           | Achievement title               |
| `date`       | `string`           | ISO date string                 |
| `description`| `string` (optional)| Details about the milestone     |

---

## State Management (`src/store/useStore.ts`)

Uses **Zustand** with `persist` middleware. Storage key: `"growth-tracker-storage"` in `localStorage`.

### State Shape
```ts
interface AppState {
  logs: LogEntry[];
  skills: Skill[];
  projects: Project[];
  milestones: Milestone[];
}
```

### Actions
| Action                | Signature                                              | Behavior                                              |
|-----------------------|--------------------------------------------------------|-------------------------------------------------------|
| `addLog`              | `(log: Omit<LogEntry, 'id'>) => void`                 | Appends with `crypto.randomUUID()` id                 |
| `addSkill`            | `(skill: Omit<Skill, 'id' \| 'history'>) => void`     | Appends with UUID + initial history entry             |
| `updateSkillLevel`    | `(id: string, level: number) => void`                  | Updates level + appends to history array              |
| `addProject`          | `(project: Omit<Project, 'id'>) => void`               | Appends with UUID                                     |
| `updateProjectStatus` | `(id: string, status: 'ongoing' \| 'completed') => void` | Toggles project status                             |
| `addMilestone`        | `(milestone: Omit<Milestone, 'id'>) => void`           | Appends with UUID                                     |

> **Note:** There are no delete or edit actions for any entity. Only add and limited update operations exist.

---

## Routing

There is **no router library** (no React Router). Navigation is handled via a `useState<Tab>` in `App.tsx` that conditionally renders one of 5 page components:

- `'dashboard'` → `<Dashboard />`
- `'logs'` → `<Logs />`
- `'skills'` → `<Skills />`
- `'projects'` → `<Projects />`
- `'milestones'` → `<Milestones />`

The `<Layout>` component provides the sidebar/bottom-nav and calls `setActiveTab()` on click.

---

## Pages & Features

### Dashboard (`src/pages/Dashboard.tsx`)
- **Summary cards**: Total counts for Projects, Skills, Milestones, and Log Entries
- **Activity Heatmap**: GitHub-style 365-day grid colored by log entry count per day (via `<Heatmap />`)
- **Skill Levels Bar Chart**: Recharts `<BarChart>` showing each skill's current level
- **Mood Trend Line Chart**: Recharts `<LineChart>` of the last 10 log entries' mood values
- **Journey Timeline**: Milestones displayed in reverse-chronological order with a vertical line connector

### Logs (`src/pages/Logs.tsx`)
- List of all log entries sorted newest-first
- Each entry shows: date, mood emoji, learned/built/challenges in a 3-column grid
- "New Entry" button opens a full-screen modal form with fields: date, learned, built, challenges, mood (emoji picker 1–5)

### Skills (`src/pages/Skills.tsx`)
- Grid of skill cards showing name, level badge (Beginner/Novice/Intermediate/Advanced/Expert), and a clickable 5-segment progress bar to update level
- "Add Skill" button opens a modal with name input and level selection

### Projects (`src/pages/Projects.tsx`)
- Grid of project cards showing title, date, description, and a toggleable status badge (ongoing ↔ completed)
- "New Project" button opens a modal with title, description, date, and status fields

### Milestones (`src/pages/Milestones.tsx`)
- Vertical timeline with trophy icons, showing title, date, and optional description
- "Add Milestone" button opens a modal form

---

## UI / Design Patterns

- **Dark theme**: `bg-zinc-950` base, `zinc-900/800` cards/borders, light text (`zinc-100/200/300/400`)
- **Accent colors**: Emerald (projects/learned), Blue (skills/built), Amber (milestones/ongoing), Purple (mood)
- **Responsive**: Desktop gets a left sidebar (`md:flex`), mobile gets a fixed bottom navigation bar
- **Modals**: Full-screen overlay (`fixed inset-0`) with backdrop blur, centered card
- **CSS utility**: `cn()` function exported from `Layout.tsx` — combines `clsx` + `tailwind-merge`
- **Animations**: Pages use `animate-in fade-in duration-500` class for entrance transitions

---

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run lint         # TypeScript type-check (tsc --noEmit)
```

### Environment Variables
- `GEMINI_API_KEY` — Set in `.env.local`, injected as `process.env.GEMINI_API_KEY` at build time

### Path Alias
- `@/*` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`)

---

## Known Limitations & Potential Improvements

1. **No delete/edit functionality** — Users cannot edit or delete logs, skills, projects, or milestones
2. **No backend** — All data is in `localStorage` only; `express`/`better-sqlite3` deps are unused
3. **No Gemini AI integration** — The API key is wired but no AI features are implemented
4. **No URL-based routing** — Tab state is lost on page refresh (always resets to Dashboard)
5. **No data export/import** — No way to back up or restore data
6. **No search or filtering** — Log entries and other lists cannot be searched or filtered
7. **No confirmation dialogs** — Actions like status toggling happen immediately
8. **Heatmap only tracks log entries** — Does not account for skill updates, project additions, etc.
