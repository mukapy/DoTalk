from django.db.models import Func, Model
from django.db.models.fields import UUIDField, DateTimeField, SlugField
from django.utils.text import slugify


class GenRandomUUID(Func):
    function = "gen_random_uuid"
    template = "%(function)s()"
    output_field = UUIDField()


class UUIDBaseModel(Model):
    uuid = UUIDField(primary_key=True, db_default=GenRandomUUID(), editable=False)

    class Meta:
        abstract = True
        required_db_vendor = 'postgresql'


class CreatedUUIDBaseModel(UUIDBaseModel):
    updated_at = DateTimeField(auto_now=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = '-created_at',


class CreatedBaseModel(Model):
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = '-created_at',


class SlugBaseModel(Model):
    slug = SlugField(unique=True, editable=False)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def save(self, *, force_insert=False, force_update=False, using=None, update_fields=None):
        self.slug = slugify(self.name)
        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)
