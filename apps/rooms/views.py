import os

from adrf.generics import ListAPIView, CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated

from rooms.filters import RoomFilter
from rooms.models import Room, Category, Topic
from rooms.serializers import RoomModelSerializer, RoomWriteSerializer, CategoryModelSerializer, TopicModelSerializer


@extend_schema(tags=['rooms'])
class RoomListAPIView(ListAPIView):
    serializer_class = RoomModelSerializer
    queryset = Room.objects.select_related('category').prefetch_related('topic').all()
    filterset_class = RoomFilter
    permission_classes = [AllowAny]


@extend_schema(tags=['rooms'])
class RoomCreateAPIView(CreateAPIView):
    serializer_class = RoomWriteSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return RoomModelSerializer
        return RoomWriteSerializer


@extend_schema(tags=['rooms'])
class RoomRetrieveAPIView(RetrieveAPIView):
    serializer_class = RoomModelSerializer
    queryset = Room.objects.select_related('category').prefetch_related('topic').all()
    permission_classes = [AllowAny]
    lookup_field = 'uuid'


@extend_schema(tags=['rooms'])
class RoomUpdateAPIView(UpdateAPIView):
    serializer_class = RoomWriteSerializer
    queryset = Room.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    lookup_field = 'uuid'

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if obj.creator_id != request.user.id:
            self.permission_denied(request, message="You are not the creator of this room.")


@extend_schema(tags=['rooms'])
class RoomDeleteAPIView(DestroyAPIView):
    queryset = Room.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if obj.creator_id != request.user.id:
            self.permission_denied(request, message="You are not the creator of this room.")

    async def perform_adestroy(self, instance):
        for field_name in ('image', 'banner'):
            field = getattr(instance, field_name)
            if field:
                try:
                    path = field.path
                    if os.path.isfile(path):
                        os.remove(path)
                except Exception:
                    pass
        await instance.adelete()


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
