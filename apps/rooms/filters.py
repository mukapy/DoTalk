from django_filters import rest_framework as filters
from .models import Room

class RoomFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='category__slug', lookup_expr='exact')

    topic = filters.ModelMultipleChoiceFilter(
        field_name='topic__slug',
        queryset=Room.topic.field.related_model.objects.all(),
        to_field_name='slug',
        conjoined=False
    )

    class Meta:
        model = Room
        fields = ['category', 'topic']