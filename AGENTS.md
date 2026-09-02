<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git Workflow

This repo follows a **three-environment promotion flow**: `test` → `stg` → `main`.

## Branches

| Branch | Environment | Deploy | Last version |
|--------|-------------|--------|--------------|
| `test` | Dev (sandbox) | Vercel preview | v1.0.0 |
| `stg` | Staging | Vercel preview | v1.0.0 |
| `main` | Production | Vercel production | v1.0.0 |

## Rules

- **Never commit directly to `main`.** It is production — everything arrives via merge.
- **Never commit directly to `stg`** unless it is a documented hotfix.
- All work happens on `test` (or short-lived feature branches merged into `test`).
- Promote `test → stg → main` in that order, always forward, with merges (not rebases) for traceability.
- Every promotion that reaches `main` should be tagged (`git tag -a vX.Y.Z`) and a GitHub Release created.

## Promotion checklist

1. Verify build: `npm run build`
2. Verify tests: `npm test` (must be green)
3. Verify lint on new code: `npm run lint` (0 errors in `src/`)
4. `git checkout stg && git merge test` → push
5. `git checkout main && git merge stg` → push
6. Tag + release (see `scripts/release.sh` if present)

## Environment config

`src/data/index.ts` switches data sources via `NEXT_PUBLIC_DATA_MODE` (`mock` default, `api` for real backend). Test/staging can use either; production should use `api` once the backend is stable.
