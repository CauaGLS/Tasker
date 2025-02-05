from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import File, PatchDict, Router
from ninja.files import UploadedFile

from .models import Media, Task, Notification
from .schemas import CreateTaskSchema, MediaSchema, TaskSchema, DetailTaskSchema, NotificationSchema

router = Router(tags=["Tasks"])


@router.get("/tasks", response=list[TaskSchema])
def get_tasks(request):
    return (
        Task.objects.select_related("created_by")
        .exclude(deleted_at__isnull=False)
        .all()
    )


@router.get("/tasks/archived", response=list[TaskSchema])
def get_archived_tasks(request):
    return (
        Task.objects.select_related("created_by").filter(deleted_at__isnull=False).all()
    )


@router.post("/tasks", response=TaskSchema)
def create_task(request, task: CreateTaskSchema):
    payload = task.dict()
    last_task = (
        Task.objects.filter(status=payload["status"], deleted_at__isnull=True)
        .values("order")
        .order_by("-order")
        .first()
    )
    payload["order"] = last_task["order"] + 1 if last_task else 1
    return Task.objects.create(**payload, created_by=request.auth)


@router.get("/tasks/{task_id}", response=DetailTaskSchema)
def get_task(request, task_id: int):
    task = get_object_or_404(Task.objects.prefetch_related("medias"), id=task_id)
    return task


@router.put("/tasks/{task_id}", response=TaskSchema)
def update_task(request, task_id: int, payload: PatchDict[CreateTaskSchema]):
    task = get_object_or_404(Task, id=task_id)

    order = payload.get("order")
    if order is not None:
        Task.objects.filter(
            order__lte=order,
            status=payload.get("status", task.status),
            deleted_at__isnull=True,
        ).update(order=F("order") - 1)

    for attr, value in payload.items():
        setattr(task, attr, value)
    task.save()

    return task


@router.delete("/tasks/{task_id}", response={204: None})
def delete_task(request, task_id: int):
    task = get_object_or_404(Task, id=task_id)
    task.deleted_at = timezone.now()
    task.save()

    return 204, None


@router.delete("/tasks/{task_id}/force", response={204: None})
def force_delete_task(request, task_id: int):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    task.save()

    return 204, None


@router.post("/tasks/{task_id}/restore", response=TaskSchema)
def restore_task(request, task_id: int):
    task = get_object_or_404(Task, id=task_id)
    task.deleted_at = None
    task.save()

    return task


@router.post("/files/upload", response=list[MediaSchema])
def upload_file(
    request, files: list[UploadedFile] = File(...), task_id: int | None = None
):
    return_files = []
    for file in files:

        media = Media.objects.create(
            file=file,
            name=file.name or "",
            content_type=file.content_type or "application/octet-stream",
            size=file.size or 0,
            created_by=request.auth,
            task_id=task_id,
        )
        return_files.append(media)

    return return_files


@router.delete("/files/{file_id}", response={204: None})
def delete_file(request, file_id: int):
    file = get_object_or_404(Media, id=file_id)
    file.delete()
    return 204, None


@router.get("/notifications", response=list[NotificationSchema])
def get_notifications(request):
    return Notification.objects.filter(user=request.auth, is_read=False).order_by("-created_at")


@router.post("/notifications/mark-all-read", response={200: None})
def mark_all_read(request):
    return Notification.objects.filter(user=request.auth, is_read=False).update(is_read=True)
    