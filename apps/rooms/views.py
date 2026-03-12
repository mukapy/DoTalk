import os

from adrf.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated

from rooms.filters import RoomFilter
from rooms.models import Room
from rooms.serializers import RoomModelSerializer, RoomWriteSerializer


@extend_schema(tags=['rooms'])
class RoomListCreateAPIView(ListCreateAPIView):
    queryset = Room.objects.select_related('category').prefetch_related('topic').all()
    filterset_class = RoomFilter
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return RoomModelSerializer
        return RoomWriteSerializer


@extend_schema(tags=['rooms'])
class RoomRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.select_related('category').prefetch_related('topic').all()
    lookup_field = 'uuid'
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return RoomModelSerializer
        return RoomWriteSerializer

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PUT', 'PATCH', 'DELETE'):
            if obj.creator_id != request.user.id:
                self.permission_denied(request, message="You are not the creator of this room.")
