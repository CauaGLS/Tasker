# Tasker backend

Django + [django-ninja](https://django-ninja.dev/) REST API, with Django
Channels (ASGI/WebSocket) for realtime notifications and Celery for
background/scheduled tasks. Managed with [`uv`](https://docs.astral.sh/uv/).

## Requirements

- Python 3.13+
- PostgreSQL
- Redis — **optional**, see "Simplified mode" below

## Setup

```bash
uv sync
cp .env.example .env   # fill in SECRET_KEY, POSTGRES_*, etc.
uv run python manage.py migrate
uv run python manage.py createsuperuser   # optional
uv run python manage.py runserver
```

The API is served under `/api/` (interactive docs at `/api/docs`), and the
Django admin is at `/admin/`.

## Simplified mode (no Redis required)

This app is designed to boot and run correctly even without Redis:

- If `REDIS_URL` is **not** set, `CHANNEL_LAYERS` falls back to
  `channels.layers.InMemoryChannelLayer` — WebSocket notifications still
  work within a single process, they just won't fan out across multiple
  processes/instances.
- If `REDIS_URL`/`CELERY_BROKER_URL` is **not** set, `CELERY_TASK_ALWAYS_EAGER`
  is enabled, so any `.delay()` call runs synchronously in-process instead
  of requiring a separate Celery worker.
- The default cache backend also falls back to Django's local-memory cache
  when `REDIS_URL` is unset.

Set `REDIS_URL` (a standard `redis://` URL) to opt back into
`channels_redis` and a real Celery broker/worker setup. See
`core/settings.py` for the exact logic.

## Running the worker/beat processes (only needed with Redis configured)

`entrypoint.sh` dispatches based on its first argument:

```bash
./entrypoint.sh            # daphne (ASGI web server), the default
./entrypoint.sh worker     # celery worker
./entrypoint.sh beat       # celery beat (scheduler)
```

## Apps

- `core/` — Django project settings, ASGI/WSGI entrypoints, the ninja
  `API` instance and URL routing, the Celery app, and the WebSocket auth
  middleware.
- `app/` — the actual task-management domain: models, API endpoints
  (`app/api.py`), schemas, the WebSocket consumer (`app/consumer.py`),
  signal handlers that broadcast task changes (`app/signals.py`), and
  Celery tasks (`app/tasks.py`).

## Environment variables

See `.env.example` for the full list. Notably:

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` — standard Django settings.
- `POSTGRES_*` — database connection.
- `CORS_ALLOWED_ORIGINS` — comma-separated list of allowed frontend
  origins; if unset, all origins are allowed (CORS is wide open), which is
  convenient for local dev but should be restricted in production.
- `REDIS_URL` — optional, see "Simplified mode" above.
- `AWS_*` — optional S3-compatible object storage for uploaded media
  (`django-storages`).
- `SENTRY_DSN` — optional error tracking.

## Deployment (Render)

`render.yaml` at the repo root of this directory is a Render Blueprint that
provisions a free Postgres database and a single web service running in
simplified mode (no Redis service). See the root `README.md` for the full
deploy walkthrough.

## Requirements export

`requirements.txt` in this directory is generated from `uv.lock` via:

```bash
uv export --format requirements-txt --no-hashes --no-dev > requirements.txt
```

It exists for environments that don't run `uv` natively; the canonical
source of truth for dependencies is `pyproject.toml`/`uv.lock`. Regenerate
it whenever dependencies change.
