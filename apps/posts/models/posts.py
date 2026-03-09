from django.db.models import CharField, TextField, BooleanField, TextChoices, ForeignKey, CASCADE, FileField, \
    ManyToManyField

from shared.models import CreatedBaseModel


class Post(CreatedBaseModel):
    class ContentRating(TextChoices):
        SAFE = "safe"
        SENSITIVE = "sensitive"

    class ModerationStatus(TextChoices):
        APPROVED = "approved"
        PENDING = "pending"
        REJECTED = "rejected"

    author = ForeignKey('users.User', CASCADE, related_name='posts')
    name = CharField(max_length=255)
    description = TextField()
    is_spoiler = BooleanField(default=False)
    content_rating = CharField(max_length=20, choices=ContentRating.choices, default=ContentRating.SAFE)
    moderation_status = CharField(max_length=20, choices=ModerationStatus.choices, default=ModerationStatus.PENDING)
    age_restricted = BooleanField(default=False)
    topic = ManyToManyField('categories.Topic', related_name='posts')
    category = ManyToManyField('categories.Category', related_name='posts')


class PostMedia(CreatedBaseModel):
    class MediaType(TextChoices):
        VIDEO = "video"
        AUDIO = "audio"
        IMAGE = "image"
        GIF = "gif"

    post = ForeignKey('posts.Post', CASCADE, related_name='media')
    file = FileField(upload_to='posts/files/%Y/%m/%d')
    media_type = CharField(max_length=20, choices=MediaType.choices, default=None, null=True)


class PostVote(CreatedBaseModel):
    class Type(TextChoices):
        UPVOTE = "upvote"
        DOWNVOTE = "downvote"

    post = ForeignKey('posts.Post', CASCADE, related_name='post_votes')
    user = ForeignKey('users.User', CASCADE, related_name='post_votes')
    type = CharField(max_length=20, choices=Type.choices)


class Comment(CreatedBaseModel):
    user = ForeignKey('users.User', CASCADE, related_name='comments')
    post = ForeignKey('posts.Post', CASCADE, related_name='comments')
    context = TextField()


class CommentVote(CreatedBaseModel):
    class Type(TextChoices):
        UPVOTE = "upvote"
        DOWNVOTE = "downvote"

    comment = ForeignKey('posts.Comment', CASCADE, related_name='comment_votes')
    user = ForeignKey('users.User', CASCADE, related_name='comment_votes')
    type = CharField(max_length=20, choices=Type.choices)
