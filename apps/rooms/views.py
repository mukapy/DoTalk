from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from rooms.filters import RoomFilter
from rooms.models import Room, Category, Topic
from rooms.serializers import RoomModelSerializer, CategoryModelSerializer, TopicModelSerializer


@extend_schema(tags=['rooms'])
class RoomListAPIView(ListAPIView):
    serializer_class = RoomModelSerializer
    queryset = Room.objects.all()
    filterset_class = RoomFilter
    permission_classes = [AllowAny]


@extend_schema(tags=['rooms'])
class CategoryListAPIView(ListAPIView):
    serializer_class = CategoryModelSerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]


@extend_schema(tags=['rooms'])
class TopicListAPIView(ListAPIView):
    serializer_class = TopicModelSerializer
    queryset = Topic.objects.all()
    permission_classes = [AllowAny]
