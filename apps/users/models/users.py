from django.contrib.auth.models import AbstractUser
from django.db.models import IntegerField, CharField, TextField, ImageField, TextChoices
from django.db.models.fields import DateField, EmailField

from shared.models import CreatedBaseModel


class User(AbstractUser, CreatedBaseModel):
    class Types(TextChoices):
        ADMIN = 'admin'
        USER = 'user'

    email = EmailField(unique=True)
    bio = TextField(blank=True, null=True)
    birth_date = DateField()
    profile_img = ImageField(upload_to='users/profile/%Y/%m/%d', null=True)
    banner = ImageField(upload_to='users/banner/%Y/%m/%d', null=True)
    type = CharField(max_length=10, choices=Types.choices, default=Types.USER)
    rating = IntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
