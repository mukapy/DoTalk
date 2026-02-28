from drf_spectacular.utils import extend_schema
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.models import User
from users.serializers import GoogleAuthSerializer, UserRegisterModelSerializer, CustomTokenObtainPairSerializer, \
    UserModelSerializer
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
class UserCheckEmailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, email):
        is_exists = User.objects.filter(email=email).exists()
        if not is_exists:
            register_sms.delay(email)

        return Response({'data': {'is_exists': is_exists}})


@extend_schema(tags=['users'])
class UserProfileRetrieveAPIView(RetrieveAPIView):
    serializer_class = UserModelSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
