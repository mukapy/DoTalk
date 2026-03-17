from django.utils import timezone
from adrf.serializers import ModelSerializer
from rest_framework.exceptions import ValidationError

from categories.models import Category, Topic, TopicRequest
from users.serializers import UserModelSerializer


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


class TopicRequestCreateSerializer(ModelSerializer):
    class Meta:
        model = TopicRequest
        fields = ('id', 'name', 'description', 'status', 'created_by', 'created_at')
        read_only_fields = ('id', 'status', 'created_by', 'created_at')

    def validate_name(self, value):
        if TopicRequest.objects.filter(name__iexact=value, status='pending').exists():
            raise ValidationError('A pending request for this topic already exists.')
        if Topic.objects.filter(name__iexact=value).exists():
            raise ValidationError('A topic with this name already exists.')
        return value


class TopicRequestListSerializer(ModelSerializer):
    created_by = UserModelSerializer(read_only=True)
    reviewed_by = UserModelSerializer(read_only=True)

    class Meta:
        model = TopicRequest
        fields = ('id', 'name', 'slug', 'description', 'status', 'created_by', 'reviewed_by', 'reviewed_at', 'created_at')
        read_only_fields = fields


class TopicRequestReviewSerializer(ModelSerializer):
    class Meta:
        model = TopicRequest
        fields = ('id', 'status')

    def validate_status(self, value):
        if value not in ('approved', 'rejected'):
            raise ValidationError('Status must be either "approved" or "rejected".')
        return value

    def validate(self, attrs):
        if self.instance and self.instance.status != 'pending':
            raise ValidationError({'detail': 'This request has already been reviewed.'})
        return attrs

    async def aupdate(self, instance, validated_data):
        status = validated_data['status']
        instance.status = status
        instance.reviewed_by = self.context['request'].user
        instance.reviewed_at = timezone.now()
        await instance.asave(update_fields=['status', 'reviewed_by', 'reviewed_at', 'updated_at'])

        if status == 'approved':
            topic = Topic(name=instance.name, created_by=instance.created_by)
            await topic.asave()
        elif status == 'rejected':
            topic = Topic(name=instance.name, created_by=instance.created_by, is_active='inactive')
            await topic.asave()

        return instance

    async def ato_representation(self, instance):
        return TopicRequestListSerializer(instance).data
