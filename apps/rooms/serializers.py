from rest_framework.serializers import ModelSerializer

from rooms.models import Category, Topic, Room


class CategoryModelSerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class TopicModelSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class RoomModelSerializer(ModelSerializer):
    category = CategoryModelSerializer(read_only=True)
    topic = TopicModelSerializer(read_only=True, many=True)

    class Meta:
        model = Room
        fields = ('uuid', 'name', 'creator', 'description', 'image', 'status',
                  'capacity', 'category', 'topic', 'type', 'visibility', 'created_at',)
