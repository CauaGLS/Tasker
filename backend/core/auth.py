from app.models import Session
from django.utils import timezone
from ninja.security import HttpBearer


class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        session = Session.objects.select_related("user").filter(token=token).first()
        if not session:
            return None

        if session.expires_at < timezone.now():
            return None

        return session.user
