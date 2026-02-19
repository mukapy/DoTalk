from rest_framework.serializers import ModelSerializer
from rooms.models import Category, Topic


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TopicSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'
