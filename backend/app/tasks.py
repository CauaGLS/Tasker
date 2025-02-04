from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from app.models import Task

from .types import TaskStatus


@shared_task
def remove_archived_tasks(days: int = 30):
    Task.objects.filter(deleted_at__lt=timezone.now() - timedelta(days=days)).delete()


@shared_task
def auto_archive_tasks(days: int = 3):
    Task.objects.filter(
        status=TaskStatus.COMPLETED,
        updated_at__lt=timezone.now() - timedelta(days=days),
    ).update(status=TaskStatus.ARCHIVED)
