from django_filters import CharFilter, ModelMultipleChoiceFilter
from django_filters.rest_framework import FilterSet

from .models import Room


class RoomFilter(FilterSet):
    category = CharFilter(field_name='category__slug', lookup_expr='exact')

    topic = ModelMultipleChoiceFilter(
        field_name='topic__slug',
        queryset=Room.topic.field.related_model.objects.all(),
        to_field_name='slug',
        conjoined=False
    )

    class Meta:
        model = Room
        fields = ['category', 'topic']
