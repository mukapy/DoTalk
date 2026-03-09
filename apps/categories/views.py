from adrf.generics import ListAPIView, ListCreateAPIView
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny, IsAuthenticated

from categories.models import Category, Topic
from categories.serializers import CategoryModelSerializer, TopicModelSerializer


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
