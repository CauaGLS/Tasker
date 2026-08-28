# Tasker

A simple To-Do task system on a KanBan layout.

## Stack

**Frontend** (`frontend/`)
- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS + Radix UI + shadcn-style components
- `@dnd-kit` for the drag-and-drop Kanban board
- `better-auth` for authentication (email/password + GitHub OAuth), talking
  directly to the Postgres `users`/`sessions`/... tables
- `@tanstack/react-query` for data fetching/caching
- `@hey-api/openapi-ts` to generate a typed API client from the backend's
  OpenAPI schema
- `react-use-websocket` for realtime updates over WebSocket
- Sentry for error tracking

**Backend** (`backend/`)
- Django 5 + [django-ninja](https://django-ninja.dev/) for the REST API
- Django Channels (ASGI, served by Daphne) for WebSocket notifications
- Celery + django-celery-beat for background/scheduled tasks
- PostgreSQL (via `psycopg`)
- Redis as the Celery broker and Channels layer backend (optional — see
  below)
- `django-storages` (S3-compatible) for media uploads
- WhiteNoise to serve static files
- Sentry for error tracking

Package management: `pnpm` on the frontend, [`uv`](https://docs.astral.sh/uv/)
on the backend.

## Project structure

```
Tasker/
├── frontend/   # Next.js app
└── backend/    # Django + Channels + Celery app
```

## Production mode: simplified (no realtime background workers)

The current production deploy intentionally runs in a **simplified mode**:
there is no Redis instance, no separate Celery worker, and no separate
Celery beat process running in production.

This is a deliberate choice for the first deploy (to fit comfortably on
Render's free tier), not a bug:

- When `REDIS_URL` is not set, Django Channels falls back to the in-memory
  channel layer. WebSocket notifications still work because the app serves
  HTTP and WebSocket from the same single process — they just won't
  broadcast across multiple processes/instances.
- When `REDIS_URL`/`CELERY_BROKER_URL` is not set, Celery tasks run
  **eagerly**: any `.delay()` call executes synchronously in the same
  process/request instead of being queued for a worker.

To restore full realtime/background-task behavior (multi-instance WebSocket
broadcast, true async task queueing, scheduled beat tasks), provision a
Redis instance, set `REDIS_URL`, and run the `worker`/`beat` processes
(see `backend/entrypoint.sh`).

## Running locally

### Backend

```bash
cd backend
uv sync
cp .env.example .env   # fill in SECRET_KEY, POSTGRES_*, etc.
uv run python manage.py migrate
uv run python manage.py runserver
```

See `backend/README.md` for more detail.

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env   # fill in NEXT_PUBLIC_SERVER_URL, POSTGRES_*, etc.
pnpm dev
```

The frontend expects the backend URL in `NEXT_PUBLIC_SERVER_URL`, and it
connects directly to the same Postgres database for `better-auth`'s own
tables, so both `.env` files should point at the same database during local
development.

## Deployment

- **Frontend → [Vercel](https://vercel.com/).** Import the repo, set the
  root directory to `frontend`, and configure the environment variables
  from `frontend/.env.example` (at minimum `NEXT_PUBLIC_SERVER_URL`,
  `NEXT_PUBLIC_FRONTEND_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and
  the `POSTGRES_*` vars for better-auth).
- **Backend → [Render](https://render.com/) (free tier).** Use
  `backend/render.yaml` as a Render Blueprint (New → Blueprint, point it at
  this repo). It provisions a free Postgres database and a single web
  service running in the simplified mode described above — no Redis
  service required. Fill in the env vars marked `sync: false` in the Render
  dashboard after the blueprint is created (`ALLOWED_HOSTS`,
  `CORS_ALLOWED_ORIGINS`, and optionally `SENTRY_DSN` / S3 credentials).

After both are deployed, set the frontend's `NEXT_PUBLIC_SERVER_URL` to the
Render backend URL, and the backend's `CORS_ALLOWED_ORIGINS`/`ALLOWED_HOSTS`
to the Vercel frontend URL.
