from django_filters import CharFilter, BaseInFilter
from django_filters.rest_framework import FilterSet

from .models import Room


class CharInFilter(BaseInFilter, CharFilter):
    pass


class RoomFilter(FilterSet):
    category = CharFilter(field_name='category__slug', lookup_expr='exact')
    topic = CharInFilter(field_name='topic__slug', lookup_expr='in')

    class Meta:
        model = Room
        fields = ['category', 'topic']
