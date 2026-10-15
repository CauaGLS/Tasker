import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# get_asgi_application() precisa rodar ANTES de importar qualquer módulo que use
# models (rotas/consumers/middleware); caso contrário, iniciar direto via
# `daphne core.asgi:application` falha com AppRegistryNotReady.
django_asgi_app = get_asgi_application()

from app.routing import websocket_urlpatterns  # noqa: E402
from core.middleware.websocket import AuthMiddleware  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
