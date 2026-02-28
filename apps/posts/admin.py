from django.contrib import admin

from posts.models import Post, PostMedia, PostVote, Comment, CommentVote


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('name', 'content_rating', 'moderation_status', 'is_spoiler', 'age_restricted')
    list_filter = ('content_rating', 'moderation_status', 'is_spoiler')
    search_fields = ('name', 'description')


@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'created_at')
    list_filter = ('media_type',)


@admin.register(PostVote)
class PostVoteAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'type')
    list_filter = ('type',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')


@admin.register(CommentVote)
class CommentVoteAdmin(admin.ModelAdmin):
    list_display = ('comment', 'user', 'created_at')
