from urllib.parse import parse_qs

from channels.security.websocket import WebsocketDenier
from app.models import Session


class AuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        scope = dict(scope)

        query_string = parse_qs(scope.get("query_string", b"").decode())
        token = query_string.get("token", [None])[0]

        if not token:
            denier = WebsocketDenier()
            return await denier(scope, receive, send)

        try:
            session = await Session.objects.aget(token=token)
            scope["user_id"] = session.user_id
        except Session.DoesNotExist:
            denier = WebsocketDenier()
            return await denier(scope, receive, send)

        # Return inner application
        return await self.inner(scope, receive, send)