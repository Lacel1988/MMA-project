from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Category, Topic, Post, Reply, PostLike
from .serializers import (
    CategorySerializer,
    TopicSerializer,
    PostSerializer,
    ReplySerializer,
    PostLikeSerializer,
)


# CATEGORY
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# TOPIC
class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.created_by != self.request.user:
            raise PermissionDenied("Csak a saját témádat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise PermissionDenied("Csak a saját témádat törölheted.")
        instance.delete()


# POST
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().select_related("topic", "author")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("Csak a saját hozzászólásodat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Csak a saját hozzászólásodat törölheted.")
        instance.delete()


# REPLY
class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Reply.objects.all().select_related("post", "author")
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("Csak a saját válaszodat módosíthatod.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Csak a saját válaszodat törölheted.")
        instance.delete()


# POST LIKE
class PostLikeViewSet(viewsets.ModelViewSet):
    queryset = PostLike.objects.all().select_related("post", "user")
    serializer_class = PostLikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("Csak a saját lájkodat törölheted.")
        instance.delete()