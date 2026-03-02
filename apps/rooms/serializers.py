import os

from adrf.serializers import ModelSerializer
from rest_framework.fields import ImageField as DRFImageField

from rooms.models import Category, Topic, Room
from shared.utils import convert_to_webp

ROOM_IMAGE_SIZE = (400, 400)
ROOM_BANNER_SIZE = (1200, 400)


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
        fields = (
            'uuid', 'name', 'creator', 'description', 'image', 'banner',
            'status', 'capacity', 'category', 'topic', 'type', 'visibility',
            'created_at',
        )


class RoomWriteSerializer(ModelSerializer):
    image = DRFImageField(required=False, allow_null=True)
    banner = DRFImageField(required=False, allow_null=True)

    class Meta:
        model = Room
        fields = (
            'name', 'description', 'image', 'banner', 'status',
            'capacity', 'category', 'topic', 'type', 'visibility',
        )

    def _process_images(self, validated_data):
        if 'image' in validated_data and validated_data['image']:
            validated_data['image'] = convert_to_webp(
                validated_data['image'], ROOM_IMAGE_SIZE
            )
        if 'banner' in validated_data and validated_data['banner']:
            validated_data['banner'] = convert_to_webp(
                validated_data['banner'], ROOM_BANNER_SIZE
            )
        return validated_data

    async def acreate(self, validated_data):
        topics = validated_data.pop('topic', [])
        validated_data = self._process_images(validated_data)

        request = self.context.get('request')
        validated_data['creator'] = request.user
        validated_data['host_user_id'] = request.user

        room = await Room.objects.acreate(**validated_data)
        if topics:
            await room.topic.aset(topics)
        return room

    async def aupdate(self, instance, validated_data):
        topics = validated_data.pop('topic', None)
        validated_data = self._process_images(validated_data)

        # Delete old image files when new ones are uploaded
        if 'image' in validated_data and instance.image:
            old_path = instance.image.path
            if os.path.isfile(old_path):
                os.remove(old_path)

        if 'banner' in validated_data and instance.banner:
            old_path = instance.banner.path
            if os.path.isfile(old_path):
                os.remove(old_path)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        await instance.asave()

        if topics is not None:
            await instance.topic.aset(topics)

        return instance
