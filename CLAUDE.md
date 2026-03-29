# Growth Tracker — Claude Context

## Project Overview
A personal learning tracker with a React/Vite frontend and Vercel serverless API backend. Single-owner app (only the first registered user can own the account).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript 5.8 |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 (API-backed, no localStorage persistence) |
| Animation | Motion 12 (Framer Motion successor) |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Date utils | date-fns 4 |
| Backend | Vercel serverless functions (`api/` directory) |
| ORM | Prisma 6 with PostgreSQL |
| Auth | Session-based with httpOnly cookies (30-day TTL) |

## Project Structure

```
src/
  App.tsx              # Root: auth check, hash-based routing, theme toggle
  store/useStore.ts    # All state + async API actions (Zustand)
  types/index.ts       # Shared TypeScript types
  lib/
    constants.ts       # Mood emojis, skill levels, heatmap colors, chart configs
    utils.ts           # cn() utility (clsx + tailwind-merge)
  components/          # Shared UI components
  pages/               # Dashboard, Logs, Skills, Projects, Milestones
api/
  auth.ts              # register / login / logout / Google OAuth
  logs/                # CRUD for LogEntry
  skills/              # CRUD for Skill + history tracking
  projects/            # CRUD for Project
  milestones/          # CRUD for Milestone
  _lib/
    auth.ts            # Session management (cookies)
    db.ts              # Prisma client singleton
    http.ts            # Helpers: parseJsonBody, isValidDate, sendServerError, etc.
    mappers.ts         # Prisma model → API response shape
    devAuth.ts         # Dev auth bypass (DEV_AUTH_BYPASS=true)
prisma/schema.prisma   # DB schema: User, Session, LogEntry, Skill, SkillHistory, Project, Milestone
```

## Data Models

```typescript
LogEntry  { id, date, learned, built, challenges, mood (1–5) }
Skill     { id, name, level (1–5), history: [{ date, level }] }
Project   { id, title, description, date, status: 'ongoing'|'completed' }
Milestone { id, title, description?, date }
```

## Routing
Hash-based, no React Router. Valid tabs: `dashboard | logs | skills | projects | milestones`.

## Development Commands

```bash
npm run dev          # Frontend only (port 3000)
npm run dev:local    # Full stack via Vercel CLI (API + frontend)
npm run build        # Production build
npm run lint         # TypeScript type check (tsc --noEmit)

npm run db:generate  # prisma generate
npm run db:push      # prisma db push
npm run db:migrate   # prisma migrate dev
```

## Environment Variables

```
DATABASE_URL / POSTGRES_PRISMA_URL   # PostgreSQL connection string
DEV_AUTH_BYPASS=true                 # Skip auth in local dev
DEV_AUTH_EMAIL=...                   # Email used for bypass user
ENABLE_GOOGLE_OAUTH=false            # Optional Google OAuth
APP_URL=...                          # App base URL (used in OAuth redirects)
GEMINI_API_KEY=...                   # Injected at build time (unused currently)
```

## Key Conventions

- **API validation**: All PATCH handlers must include `typeof` checks before calling `.trim()` on string fields, and reject empty strings for required fields. Numeric fields (mood, level) must check `typeof x !== 'number'` before range checks.
- **Memoization**: Sorted/derived arrays in page components must be wrapped in `useMemo`. Avoid inline sorts/filters in render.
- **API error responses**: Use `sendServerError(res, error)` for 500s, return 400 with `{ error: '...' }` for validation failures.
- **Theme**: Dark by default (`bg-zinc-950`). Light mode toggled via `html.light` class. Use `[.light_&]:` Tailwind variant for light overrides.
- **No test suite**: Verify correctness via `npm run lint` (zero new TS errors) and manual review.
- **Branch discipline**: All changes go on a feature branch; never commit directly to `main`.

## Authentication Flow
1. `GET /api/auth?action=bootstrap` — check if owner exists + Google OAuth enabled
2. `POST /api/auth?action=register` — create owner (first user only)
3. `POST /api/auth?action=login` — email/password login
4. `GET /api/auth?action=me` — verify session (used by `App.tsx` on load)
5. `POST /api/auth?action=logout` — destroy session cookie

In local dev with `DEV_AUTH_BYPASS=true`, all API handlers skip session checks and use a synthetic user from `devAuth.ts`.
