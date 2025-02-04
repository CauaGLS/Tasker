from datetime import datetime

from core.schemas import UserSchema
from ninja import ModelSchema, Schema

from .models import Media, Task
from .types import TaskStatus


class MediaSchema(ModelSchema):
    id: int
    created_by: UserSchema

    class Meta:
        model = Media
        fields = "__all__"


class TaskSchema(ModelSchema):
    id: int
    created_by: UserSchema
    status: TaskStatus
    tags: list[str] = []

    class Meta:
        model = Task
        fields = "__all__"


class DetailTaskSchema(ModelSchema):
    id: int
    created_by: UserSchema
    status: TaskStatus
    medias: list[MediaSchema]
    tags: list[str] = []

    class Meta:
        model = Task
        fields = "__all__"


class CreateTaskSchema(Schema):
    title: str
    status: TaskStatus = TaskStatus.PENDING
    description: str
    expected_date: datetime | None = None
    tags: list[str] = []
    order: int = 0


class ArchiveTaskSchema(Schema):
    status: TaskStatus



