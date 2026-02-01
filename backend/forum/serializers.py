from rest_framework import serializers
from .models import Category, Topic, Post, Reply, PostLike


class ReplySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Reply
        fields = ["id", "author", "author_username", "content", "replied_at"]


class PostLikeSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PostLike
        fields = ["id", "user", "user_username", "liked_at"]


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    likes = PostLikeSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_username",
            "content",
            "posted_at",
            "replies",
            "likes",
        ]


class TopicSerializer(serializers.ModelSerializer):
    posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = ["id", "title", "description", "created_by", "created_at", "posts"]


class CategorySerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "topics"]