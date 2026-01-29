from rest_framework import serializers
from .models import Category, Topic, Post, Reply, PostLike


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class TopicSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True
    )

    class Meta:
        model = Topic
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]


class ReplySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Reply
        fields = [
            "id",
            "post",
            "author",
            "author_username",
            "content",
            "replied_at",
        ]
        read_only_fields = ["author", "replied_at"]


class PostLikeSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PostLike
        fields = [
            "id",
            "post",
            "user",
            "user_username",
            "liked_at",
        ]
        read_only_fields = ["user", "liked_at"]


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "topic",
            "author",
            "author_username",
            "content",
            "posted_at",
            "replies",
            "likes_count",
        ]
        read_only_fields = ["author", "posted_at"]
