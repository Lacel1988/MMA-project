from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Division, Fighter
from .serializers import DivisionSerializer, FighterSerializer

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Read (GET/HEAD/OPTIONS) -> everyone
    Write (POST/PATCH/PUT/DELETE) -> authenticated staff only
    """

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class FighterViewSet(viewsets.ModelViewSet):
    queryset = Fighter.objects.all()
    serializer_class = FighterSerializer
    permission_classes = [IsAdminOrReadOnly]


class DivisionViewSet(viewsets.ModelViewSet):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer
    permission_classes = [IsAdminOrReadOnly]


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not username or not password:
            return Response(
                {"detail": "username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response(
            {"id": user.id, "username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response(
            {
                "id": u.id,
                "username": u.username,
                "email": getattr(u, "email", ""),
                "is_staff": u.is_staff,
                "is_superuser": u.is_superuser,
            }
        )
