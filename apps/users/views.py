from adrf.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, GenericAPIView
from asgiref.sync import sync_to_async
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.models import User
from users.serializers import (
    GoogleAuthSerializer,
    UserRegisterModelSerializer,
    CustomTokenObtainPairSerializer,
    UserModelSerializer,
    UserChangePasswordSerializer,
    UserSetPasswordSerializer,
    UserUpdateProfileSerializer,
)
from users.tasks import register_sms


@extend_schema(tags=['auth'])
class GoogleLoginCreateAPIView(CreateAPIView):
    serializer_class = GoogleAuthSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()


@extend_schema(tags=['auth'])
class RegisterCreateAPIView(CreateAPIView):
    serializer_class = UserRegisterModelSerializer
    permission_classes = [AllowAny]
    queryset = User.objects.all()


@extend_schema(tags=['auth'])
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=['auth'])
class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


@extend_schema(tags=['auth'])
class UserCheckEmailAPIView(GenericAPIView):
    permission_classes = [AllowAny]

    async def get(self, request, email):
        is_exists = await User.objects.filter(email=email).aexists()
        if not is_exists:
            register_sms.delay(email)

        return Response({'data': {'is_exists': is_exists}})


@extend_schema(tags=['users'])
class UserChangePasswordUpdateAPIView(UpdateAPIView):
    serializer_class = UserChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    async def aget_object(self):
        return self.request.user


@extend_schema(tags=['users'])
class UserSetPasswordAPIView(UpdateAPIView):
    serializer_class = UserSetPasswordSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    async def aget_object(self):
        return self.request.user


@extend_schema(tags=['users'])
class UserUpdateProfileAPIView(UpdateAPIView):
    serializer_class = UserUpdateProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['patch']

    async def aget_object(self):
        return self.request.user


@extend_schema(tags=['users'])
class UserProfileRetrieveAPIView(RetrieveAPIView):
    serializer_class = UserModelSerializer
    permission_classes = [IsAuthenticated]

    async def aget_object(self):
        return self.request.user


@extend_schema(tags=['auth'])
class LogoutAPIView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    async def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({"detail": "Refresh token is required."}, status=400)
        try:
            token = RefreshToken(refresh)
            await sync_to_async(token.blacklist)()
        except TokenError:
            pass
        return Response({"success": True})
