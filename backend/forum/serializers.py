from rest_framework import serializers
from .models import Category, Topic, Post, Reply, PostLike


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class ReplySerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)

    post = serializers.PrimaryKeyRelatedField(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source="post",
        write_only=True
    )

    class Meta:
        model = Reply
        fields = [
            "id",
            "post",
            "post_id",
            "author",
            "author_username",
            "content",
            "replied_at",
        ]
        read_only_fields = ["author", "replied_at", "post"]


class PostLikeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    post = serializers.PrimaryKeyRelatedField(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source="post",
        write_only=True
    )

    class Meta:
        model = PostLike
        fields = [
            "id",
            "post",
            "post_id",
            "user",
            "user_username",
            "liked_at",
        ]
        read_only_fields = ["user", "liked_at", "post"]


class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)

    topic = serializers.PrimaryKeyRelatedField(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        source="topic",
        write_only=True
    )

    replies = ReplySerializer(many=True, read_only=True)
    likes = PostLikeSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "topic",
            "topic_id",
            "author",
            "author_username",
            "content",
            "posted_at",
            "replies",
            "likes",
        ]
        read_only_fields = ["author", "posted_at", "topic"]


class TopicSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True
    )
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "created_by",
            "created_by_username",
            "created_at",
            "posts",
        ]
        read_only_fields = ["created_by", "created_at"]