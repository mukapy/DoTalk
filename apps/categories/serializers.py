from adrf.serializers import ModelSerializer

from categories.models import Category, Topic


class CategoryModelSerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id', 'slug')


class TopicModelSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'name', 'slug', 'created_by')
        read_only_fields = ('id', 'slug', 'created_by')
