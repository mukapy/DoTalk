from django.db.models import CharField, ForeignKey, CASCADE

from shared.models import SlugBaseModel


class Category(SlugBaseModel):
    name = CharField(max_length=225)


class Topic(SlugBaseModel):
    name = CharField(max_length=225)
    category = ForeignKey('rooms.Category', CASCADE, related_name='topics')
