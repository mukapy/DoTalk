from django_filters import CharFilter, BaseInFilter
from django_filters.rest_framework import FilterSet

from .models import Room


class CharInFilter(BaseInFilter, CharFilter):
    pass


class RoomFilter(FilterSet):
    category = CharFilter(field_name='category__slug', lookup_expr='exact')
    topic = CharInFilter(field_name='topic__slug', lookup_expr='in')
    search = CharFilter(field_name='name', lookup_expr='icontains')
    type = CharFilter(field_name='type', lookup_expr='exact')

    class Meta:
        model = Room
        fields = ['category', 'topic', 'search', 'type']
