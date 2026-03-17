from django.db.models.fields import CharField, TextField, DateTimeField
from django.db.models import ForeignKey, SET_NULL, TextChoices

from shared.models import SlugBaseModel, CreatedSlugBaseModel


class Category(SlugBaseModel):
    name = CharField(max_length=225)


class Topic(SlugBaseModel):
    name = CharField(max_length=225)
    is_active = CharField(max_length=10, default='active')
    created_by = ForeignKey('users.User', SET_NULL, null=True, blank=True, related_name='created_topics')


class TopicRequest(CreatedSlugBaseModel):
    class Status(TextChoices):
        PENDING = 'pending'
        APPROVED = 'approved'
        REJECTED = 'rejected'

    name = CharField(max_length=225)
    description = TextField(blank=True, null=True)
    created_by = ForeignKey('users.User', SET_NULL, null=True, blank=True, related_name='created_topic_requests')
    status = CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reviewed_by = ForeignKey('users.User', SET_NULL, null=True, blank=True, related_name='reviewed_topic_requests')
    reviewed_at = DateTimeField(null=True, blank=True)
