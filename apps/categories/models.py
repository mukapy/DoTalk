from django.db.models.fields import CharField, TextField, BooleanField
from django.db.models import ForeignKey, SET_NULL

from shared.models import SlugBaseModel, CreatedSlugBaseModel


class Category(SlugBaseModel):
    name = CharField(max_length=225)


class Topic(SlugBaseModel):
    name = CharField(max_length=225)
    created_by = ForeignKey('users.User', SET_NULL, null=True, blank=True, related_name='created_topics', )


class TopicRequest(CreatedSlugBaseModel):
    name = CharField(max_length=225)
    description = TextField(blank=True, null=True)
    created_by = ForeignKey('users.User', SET_NULL, null=True, blank=True, related_name='created_topic_requests')
    is_approved = BooleanField(default=False)
