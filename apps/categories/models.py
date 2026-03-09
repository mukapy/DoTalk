from django.db.models.fields import CharField
from django.db.models import ForeignKey, SET_NULL

from shared.models import SlugBaseModel


class Category(SlugBaseModel):
    name = CharField(max_length=225)


class Topic(SlugBaseModel):
    name = CharField(max_length=225)
    created_by = ForeignKey(
        'users.User', SET_NULL,
        null=True, blank=True,
        related_name='created_topics',
    )
