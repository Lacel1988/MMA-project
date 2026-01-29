from django.contrib import admin
from .models import Category, Topic, Post, Reply, PostLike


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)
    ordering = ("name",)


class PostInline(admin.TabularInline):
    model = Post
    extra = 0
    readonly_fields = ("posted_at",)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "created_by", "created_at")
    list_filter = ("category", "created_by", "created_at")
    search_fields = ("title", "description")
    inlines = [PostInline]
    ordering = ("-created_at",)


class ReplyInline(admin.TabularInline):
    model = Reply
    extra = 0
    readonly_fields = ("replied_at",)


class PostLikeInline(admin.TabularInline):
    model = PostLike
    extra = 0
    readonly_fields = ("liked_at",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "topic", "author", "posted_at")
    list_filter = ("topic", "author", "posted_at")
    search_fields = ("content",)
    inlines = [ReplyInline, PostLikeInline]
    ordering = ("-posted_at",)


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "author", "replied_at")
    list_filter = ("author", "replied_at")
    search_fields = ("content",)
    ordering = ("-replied_at",)


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "liked_at")
    list_filter = ("liked_at", "user")
    search_fields = ("post__content", "user__username")
    ordering = ("-liked_at",)
