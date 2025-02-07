from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Task, Notification
from .schemas import DetailTaskSchema


@receiver(post_save, sender=Task)
def task_post_save(sender, instance: Task, created: bool, **kwargs):
    task = DetailTaskSchema.from_orm(instance).model_dump(mode="json")

    task["medias"] = [{"id": media.id, "file": media.file.url} for media in instance.medias.all()]

    group_name = "all"
    channel_layer = get_channel_layer()

    if created:
        event = "task:created"
        message = f"{instance.created_by.name} criou a tarefa '{instance.title}'"
    elif instance.deleted_at:
        event = "task:archived"
        message = f"{instance.created_by.name} arquivou a tarefa '{instance.title}'"
    else:
        event = "task:updated"
        message = f"{instance.created_by.name} atualizou a tarefa '{instance.title}'"

    Notification.objects.create(
        user=instance.created_by,
        task=instance,
        message=message
    )

    async_to_sync(channel_layer.group_send)(
        group_name,
        {"type": "send.broadcast", "data": {"event": event, "task": task, "message": message}},
    )

