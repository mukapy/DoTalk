import os

import httpx
from django.conf import settings
from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, IntegerField, ImageField as DRFImageField
from adrf.serializers import Serializer, ModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from shared.utils import convert_to_webp
from users.models import User
from users.tasks import register_key

PROFILE_IMAGE_SIZE = (400, 400)
PROFILE_BANNER_SIZE = (1200, 400)

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class UserModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'birth_date', 'bio', 'profile_img', 'banner', 'rating']


class UserRegisterModelSerializer(ModelSerializer):
    code = IntegerField(min_value=100_000, max_value=999_999, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'code', 'password', 'username']
        extra_kwargs = {
            'email': {'write_only': True},
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise ValidationError("Username already exists")
        return value

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code', None)
        cache_code = cache.get(register_key(email))
        if not cache_code or int(code) != int(cache_code):
            raise ValidationError({"code": "Wrong or expired code"})
        return attrs

    async def acreate(self, validated_data):
        validated_data.pop('code')

        password = validated_data.pop('password')

        user = await User.objects.acreate_user(
            email=validated_data.pop('email'),
            password=password,
            is_active=True,
            **validated_data,
        )
        user.first_name = f'user-{user.id}'
        await user.asave(update_fields=['first_name'])

        self.user = user
        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(self.user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "data": UserModelSerializer(self.user).data
        }


class GoogleAuthSerializer(Serializer):
    token = CharField()

    def validate_token(self, token):
        try:
            response = httpx.get(
                GOOGLE_TOKEN_INFO_URL,
                params={"id_token": token}
            )

            if response.status_code != 200:
                raise ValidationError("Invalid Google token.")

            idinfo = response.json()

            if idinfo.get('aud') != settings.GOOGLE_CLIENT_ID:
                raise ValidationError("Token audience mismatch.")

            email = idinfo.get('email')
            if not email:
                raise ValidationError("Email not provided by Google.")

            return idinfo
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Invalid Google token: {str(e)}")

    async def acreate(self, validated_data):
        idinfo = validated_data['token']
        email = User.objects.normalize_email(idinfo['email'])
        given_name = idinfo.get('given_name', '')
        family_name = idinfo.get('family_name', '')

        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while await User.objects.filter(username=username).aexists():
            username = f"{base_username}{counter}"
            counter += 1

        user, created = await User.objects.aget_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': given_name,
                'last_name': family_name,
                'is_active': True,
            }
        )

        if created:
            user.set_unusable_password()
            await user.asave()

        self.user = user
        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(self.user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "data": UserModelSerializer(self.user).data
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs) -> dict[str, str]:
        data = super().validate(attrs)

        data["data"] = UserModelSerializer(self.user).data

        return data


class UserChangePasswordSerializer(Serializer):
    old_password = CharField(max_length=255, required=True)
    password = CharField(max_length=255, required=True)
    confirm_password = CharField(max_length=255, required=True)

    def validate(self, attrs: dict):
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise ValidationError({"old_password": "Old password is not correct"})

        if attrs['password'] != attrs['confirm_password']:
            raise ValidationError({"confirm_password": "Passwords do not match"})

        return attrs


class UserUpdateProfileSerializer(ModelSerializer):
    profile_img = DRFImageField(required=False, allow_null=True)
    banner = DRFImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'bio', 'birth_date', 'profile_img', 'banner']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise ValidationError("Username already exists")
        return value

    def _process_images(self, validated_data):
        if 'profile_img' in validated_data and validated_data['profile_img']:
            validated_data['profile_img'] = convert_to_webp(
                validated_data['profile_img'], PROFILE_IMAGE_SIZE
            )
        if 'banner' in validated_data and validated_data['banner']:
            validated_data['banner'] = convert_to_webp(
                validated_data['banner'], PROFILE_BANNER_SIZE
            )
        return validated_data

    async def aupdate(self, instance, validated_data):
        validated_data = self._process_images(validated_data)

        if 'profile_img' in validated_data and instance.profile_img:
            old_path = instance.profile_img.path
            if os.path.isfile(old_path):
                os.remove(old_path)

        if 'banner' in validated_data and instance.banner:
            old_path = instance.banner.path
            if os.path.isfile(old_path):
                os.remove(old_path)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        await instance.asave()
        return instance
