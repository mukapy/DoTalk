import httpx
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, IntegerField
from adrf.serializers import Serializer, ModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.tasks import register_key

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class UserModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'birth_date', 'bio', 'profile_img', 'rating']


class UserRegisterModelSerializer(ModelSerializer):
    code = IntegerField(min_value=100_000, max_value=999_999, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'code', 'password', 'username']
        extra_kwargs = {'email': {'write_only': True}}

    async def validate_email(self, value):
        if await User.objects.filter(email=value).aexists():
            raise ValidationError("Email already exists")
        return value

    async def validate_username(self, value):
        if await User.objects.filter(username=value).aexists():
            raise ValidationError("Username already exists")
        return value

    async def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code', None)
        cache_code = await cache.aget(register_key(email))
        if not cache_code or int(code) != int(cache_code):
            raise ValidationError({"code": "Wrong or expired code"})
        return attrs

    async def acreate(self, validated_data):
        validated_data.pop('code')

        password = validated_data.pop('password')
        validated_data['password'] = make_password(password)

        user = await User.objects.acreate(**validated_data)
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

    async def validate_token(self, token):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
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
        email = idinfo['email']
        given_name = idinfo.get('given_name', '')
        family_name = idinfo.get('family_name', '')

        # Generate a username from the email (before the @)
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


class CustomTokenObtainPairSerializer(TokenObtainSerializer):
    token_class = RefreshToken

    def validate(self, attrs) -> dict[str, str]:
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        data["data"] = UserModelSerializer(self.user).data

        return data
