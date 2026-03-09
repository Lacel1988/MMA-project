from rest_framework import viewsets, permissions, mixins
from rest_framework.exceptions import PermissionDenied

from .models import Category, Topic, Post, Reply, PostLike
from .serializers import (
    CategorySerializer,
    TopicSerializer,
    PostSerializer,
    ReplySerializer,
    PostLikeSerializer,
)
from .permissions import IsAdminOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().select_related("category", "created_by").order_by("-created_at")
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
<<<<<<< HEAD
        if serializer.instance.created_by != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját témádat módosíthatod (vagy moderátor).")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját témádat törölheted (vagy moderátor).")
=======
        user = self.request.user
        if serializer.instance.created_by != user and not user.is_staff:
            raise PermissionDenied("Csak a saját témádat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.created_by != user and not user.is_staff:
            raise PermissionDenied("Csak a saját témádat törölheted.")
>>>>>>> origin/forum-alpha
        instance.delete()


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related("topic", "author").prefetch_related("replies", "likes").order_by("posted_at")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
<<<<<<< HEAD
        if serializer.instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját hozzászólásodat módosíthatod (vagy moderátor).")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját hozzászólásodat törölheted (vagy moderátor).")
=======
        user = self.request.user
        if serializer.instance.author != user and not user.is_staff:
            raise PermissionDenied("Csak a saját hozzászólásodat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.author != user and not user.is_staff:
            raise PermissionDenied("Csak a saját hozzászólásodat törölheted.")
>>>>>>> origin/forum-alpha
        instance.delete()


class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Reply.objects.all().select_related("post", "author").order_by("replied_at")
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
<<<<<<< HEAD
        if serializer.instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját válaszodat módosíthatod (vagy moderátor).")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Csak a saját válaszodat törölheted (vagy moderátor).")
        instance.delete()


class PostLikeViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    queryset = PostLike.objects.all().select_related("post", "user").order_by("-liked_at")
=======
        user = self.request.user
        if serializer.instance.author != user and not user.is_staff:
            raise PermissionDenied("Csak a saját válaszodat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.author != user and not user.is_staff:
            raise PermissionDenied("Csak a saját válaszodat törölheted.")
        instance.delete()


# LIKE
class PostLikeViewSet(viewsets.ModelViewSet):
    queryset = PostLike.objects.all().select_related("post", "user")
>>>>>>> origin/forum-alpha
    serializer_class = PostLikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
<<<<<<< HEAD
            raise PermissionDenied("Csak a saját lájkodat törölheted (vagy moderátor).")
=======
            raise PermissionDenied("Csak a saját lájkodat törölheted.")
>>>>>>> origin/forum-alpha
        instance.delete()