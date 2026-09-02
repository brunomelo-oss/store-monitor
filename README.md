# Store Monitor

Multi-tenant platform for monitoring Google Play Store and Apple App Store applications. Built with Next.js 16, Express, and Prisma.

## Architecture

```
store-monitor/
├── src/                        # Frontend (Next.js 16, React 19)
│   ├── app/                    # App Router pages
│   │   ├── apps/[id]/          # App detail (14 tabs)
│   │   ├── admin/connections   # Store connection management
│   │   ├── notifications/      # Notification center
│   │   ├── activity/           # Activity feed
│   │   ├── health/             # System health
│   │   └── sync/               # Sync management
│   ├── components/             # Shared components
│   ├── features/               # Feature modules
│   ├── services/               # API client services
│   ├── contexts/               # React contexts
│   └── hooks/                  # Custom hooks (TanStack Query)
│
├── server/                     # Backend (Express, Prisma)
│   ├── prisma/                 # Schema + migrations + seeds
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── providers/          # Store API integrations
│   │   ├── jobs/               # Job dispatchers
│   │   ├── workers/            # Background workers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   ├── lib/                # Utilities (env, logger, etc.)
│   │   └── validators/         # Zod validation schemas
│   └── └── types/              # TypeScript interfaces
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended)
- npm

### Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd store-monitor
npm install
cd server && npm install && cd ..

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL, JWT_SECRET, etc.
echo 'NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"' > .env.local

# 3. Database
cd server
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ..

# 4. Start development servers
cd server && npm run dev &    # Backend → http://localhost:3001
cd .. && npm run dev          # Frontend → http://localhost:3000
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@sasi.com.br | Owner123@ |
| Admin | bruno.melo@sasi.com.br | Admin123@ |
| Manager | manager@sasi.com.br | Manager123@ |
| Viewer | user@sasi.com.br | User123@ |

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **State:** TanStack Query (React Query)
- **Charts:** Recharts
- **Auth:** JWT cookies, role-based access (OWNER/ADMIN/MANAGER/VIEWER)
- **i18n:** Portuguese, English, Arabic

### Backend
- **Runtime:** Express + tsx (TypeScript execution)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Validation:** Zod schemas
- **Encryption:** AES-256-GCM for store credentials

### Workers
- **PollingDispatcher:** In-process job queue (5s interval)
- **Job types:** SYNC, NOTIFICATION, ANALYTICS_UPDATE, RETRY
- **Swap-ready:** BullMQ / Cloud Tasks

## API Routes

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, register, refresh, reset password |
| `/api/apps` | App CRUD, pin, move, bulk replace |
| `/api/users` | User management (admin) |
| `/api/invites` | Invite management |
| `/api/v1/sync` | Trigger sync, history, jobs |
| `/api/v1/notifications` | List, mark read, mark all read |
| `/api/v1/activity` | Aggregated activity feed |
| `/api/v1/health` | System health check |
| `/api/v1/audit-logs` | Audit trail with filters |
| `/api/v1/store-connections` | Store connection CRUD + test |

## Features

- **Command Center Dashboard** — Real-time metrics, sync frequency chart, app status grid
- **App Detail** — 14 tabs: Overview, Google Play, App Store, Versions, Builds, Releases, Tracks, Analytics, Ratings, Reviews, Sync History, Notifications, Audit Log, Timeline
- **Connection Wizard** — Add Google Play / App Store Connect credentials with encrypted storage
- **Sync Engine** — Manual + scheduled sync with provider abstraction layer
- **Notification Center** — Categorized, searchable, mark read
- **Activity Feed** — Chronological timeline of all system events
- **Health Center** — Component status, database connectivity, uptime
- **Global Search** — CMD+K command palette for apps, pages, actions
- **Multi-tenant** — Organization-scoped users, apps, and data

## Store Integrations (Extensible)

Providers implement the `SyncProvider` interface and register via `ProviderRegistry`:

```typescript
interface SyncProvider {
  syncAppInfo(appId: number): Promise<SyncOperationResult<AppInfoData>>
  syncVersions(appId: number): Promise<SyncOperationResult<VersionData[]>>
  syncBuilds(appId: number): Promise<SyncOperationResult<BuildData[]>>
  syncReviews(appId: number): Promise<SyncOperationResult<ReviewData[]>>
  syncRatings(appId: number): Promise<SyncOperationResult<RatingData>>
  syncAnalytics(appId: number, since: Date): Promise<SyncOperationResult<AnalyticsData>>
}
```

Currently stubbed for validation. Ready for Google Play Developer API and App Store Connect API.

## Development

```bash
npm run build       # Production build
npm run lint        # ESLint
npm test            # Vitest
cd server && npm run typecheck   # TypeScript check
```

## Git Workflow (test → stg → main)

The project uses a **three-environment promotion flow**. Vercel deploys a preview for every branch automatically; only `main` triggers the production deployment.

| Branch | Environment | Deploy |
|--------|-------------|--------|
| `test` | Dev (sandbox) | Vercel preview |
| `stg` | Staging | Vercel preview |
| `main` | Production | Vercel production |

### Rules

- **Never commit directly to `main`** — it is production, everything arrives via merge.
- **Never commit directly to `stg`** unless it is a documented hotfix.
- All work happens on `test` (or short-lived feature branches merged into `test`).
- Promote `test → stg → main` in order, always forward, using merges (not rebases).
- Every promotion reaching `main` is tagged (`git tag -a vX.Y.Z`) and released on GitHub.

### Promoting a release

```bash
# 1. Verify locally
npm run build && npm test && npm run lint

# 2. test → stg
git checkout stg && git merge test && git push

# 3. stg → main
git checkout main && git merge stg && git push

# 4. Tag + release
git tag -a vX.Y.Z -m "chore: release vX.Y.Z" && git push origin vX.Y.Z
gh release create vX.Y.Z --title "vX.Y.Z" --notes-from-tag
```

### Environment data mode

`src/data/index.ts` switches data sources via `NEXT_PUBLIC_DATA_MODE`:

- `mock` (default) — instant mock data, no backend needed.
- `api` — talks to the real backend (`NEXT_PUBLIC_BACKEND_URL`).

Test/staging may use either; **production should use `api`** once the backend is stable.

## Deployment

### Frontend (Vercel)

The frontend is a Next.js app — deploy directly to Vercel:

```bash
npm i -g vercel
vercel --prod
```

Set environment variables:
- `NEXT_PUBLIC_BACKEND_URL` → your backend URL

### Backend

The Express server can be deployed to Railway, Render, or a VPS:

```bash
cd server
npm run build       # Compile TypeScript
npm start           # Run compiled JS
```

Required environment variables documented in `server/.env.example`.

## License

Proprietary — SASI Comunicação Ágil
