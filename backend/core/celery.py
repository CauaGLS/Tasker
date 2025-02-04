import os

from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("todos")

# Read config from Django settings, using a dedicated namespace.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover tasks in any installed apps.
app.autodiscover_tasks()


app.conf.beat_schedule = {
    "remove-archived-tasks": {
        "task": "app.tasks.remove_archived_tasks",
        "schedule": crontab(minute=0, hour=0),
    },
    "auto-archive-tasks": {
        "task": "app.tasks.auto_archive_tasks",
        "schedule": crontab(minute=0, hour=0),
    },
}
