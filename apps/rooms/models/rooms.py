from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import ImageField, ForeignKey, CASCADE, TextChoices, ManyToManyField
from django.db.models.fields import CharField, TextField, PositiveSmallIntegerField, BooleanField, PositiveIntegerField

from shared.models import CreatedUUIDBaseModel, CreatedBaseModel


class Room(CreatedUUIDBaseModel):
    class Type(TextChoices):
        VIDEO = 'VIDEO'
        VOICE = 'VOICE'
        CHAT = 'CHAT'

    class Status(TextChoices):
        UPCOMING = 'upcoming'
        ACTIVE = 'active'
        INACTIVE = 'inactive'

    name = CharField(max_length=255)
    creator = ForeignKey('users.User', CASCADE, related_name='created_rooms')
    description = TextField(null=True, blank=True)
    banner = ImageField(upload_to='rooms/banner/%Y/%m/%d', null=True)
    image = ImageField(upload_to='rooms/img/%Y/%m/%d', null=True)
    host_user_id = ForeignKey('users.User', CASCADE, related_name='hosted_rooms')
    status = CharField(max_length=10, choices=Status.choices, default=Status.UPCOMING)
    capacity = PositiveSmallIntegerField(validators=[MinValueValidator(2), MaxValueValidator(15)])
    type = CharField(max_length=10, choices=Type.choices, default=Type.VIDEO)
    visibility = BooleanField(default=True)
    category = ForeignKey('rooms.Category', CASCADE, related_name='rooms')
    topic = ManyToManyField('rooms.Topic')


class Invitation(CreatedUUIDBaseModel):
    class Initiator(TextChoices):
        CREATOR = 'creator', 'Invited by creator'
        USER = 'user', 'Requested by user'

    user = ForeignKey('users.User', CASCADE, related_name='invited_rooms')
    room = ForeignKey('rooms.Room', CASCADE, related_name='invited_room')
    initiated_by = CharField(max_length=10, choices=Initiator.choices, default=Initiator.CREATOR)
    cost = PositiveIntegerField(default=0, null=True)
    is_accepted = BooleanField(default=False)


class Message(CreatedBaseModel):
    context = TextField(blank=True)
    room = ForeignKey('rooms.Room', CASCADE, related_name='messages')
    sender = ForeignKey('users.User', CASCADE, related_name='sent_messages')
