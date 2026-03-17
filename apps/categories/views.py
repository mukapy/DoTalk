from adrf.generics import ListAPIView, ListCreateAPIView, UpdateAPIView
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from categories.models import Category, Topic, TopicRequest
from categories.serializers import (
    CategoryModelSerializer,
    TopicModelSerializer,
    TopicRequestCreateSerializer,
    TopicRequestListSerializer,
    TopicRequestReviewSerializer,
)
from shared.permissions import IsModeratorOrAdmin


@extend_schema(tags=['categories'])
class CategoryListAPIView(ListAPIView):
    serializer_class = CategoryModelSerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]


@extend_schema(tags=['topics'])
class TopicListCreateAPIView(ListCreateAPIView):
    serializer_class = TopicModelSerializer
    queryset = Topic.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    async def perform_acreate(self, serializer):
        await serializer.asave(created_by=self.request.user)


@extend_schema(tags=['topic-requests'])
class TopicRequestCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TopicRequestCreateSerializer
        return TopicRequestListSerializer

    def get_queryset(self):
        return TopicRequest.objects.filter(created_by=self.request.user)

    async def perform_acreate(self, serializer):
        await serializer.asave(created_by=self.request.user)


@extend_schema(tags=['topic-requests'])
class TopicRequestModeratorListAPIView(ListAPIView):
    serializer_class = TopicRequestListSerializer
    permission_classes = [IsModeratorOrAdmin]

    def get_queryset(self):
        queryset = TopicRequest.objects.select_related('created_by', 'reviewed_by')
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        else:
            queryset = queryset.filter(status='pending')
        return queryset


@extend_schema(tags=['topic-requests'])
class TopicRequestReviewUpdateAPIView(UpdateAPIView):
    serializer_class = TopicRequestReviewSerializer
    permission_classes = [IsModeratorOrAdmin]
    queryset = TopicRequest.objects.select_related('created_by', 'reviewed_by')
    http_method_names = ['patch']
