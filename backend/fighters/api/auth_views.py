from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = (request.data.get("username") or "").strip()
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""
    password2 = request.data.get("password2") or ""

    if not username:
        return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(username) < 3:
        return Response({"detail": "Username must be at least 3 characters."}, status=status.HTTP_400_BAD_REQUEST)

    if not password:
        return Response({"detail": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 12:
        return Response({"detail": "Password must be at least 12 characters."}, status=status.HTTP_400_BAD_REQUEST)
    if password != password2:
        return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "This username is already taken."}, status=status.HTTP_400_BAD_REQUEST)

    if email and User.objects.filter(email=email).exists():
        return Response({"detail": "This email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email or "", password=password)

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response(
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        }
    )
