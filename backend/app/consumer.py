from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import Notification
from asgiref.sync import sync_to_async


class Consumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = "all"
        if self.channel_layer:
            await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        if self.scope.get("user"):
            user = self.scope["user"]
            notifications = await sync_to_async(list)(
                Notification.objects.filter(user=user, is_read=False)
                .values("id", "message", "created_at")
                .order_by("-created_at")
            )
            await self.send_json({"event": "notification_list", "data": notifications})

    async def disconnect(self, close_code):
        if self.channel_layer:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_broadcast(self, content):
        await self.send_json(content["data"])

    async def send_notification(self, content):
        await self.send_json({"event": "notification", "data": content["data"]})

