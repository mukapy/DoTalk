from django.urls import path

from users.views import (
    RegisterCreateAPIView,
    GoogleLoginCreateAPIView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    UserCheckEmailAPIView,
    UserProfileRetrieveAPIView,
    UserChangePasswordUpdateAPIView,
    UserUpdateProfileAPIView,
    LogoutAPIView,
)

urlpatterns = [
    path('auth/check-email/<str:email>/', UserCheckEmailAPIView.as_view(), name='check-email'),
    path('auth/register/', RegisterCreateAPIView.as_view(), name='register'),
    path('auth/google/', GoogleLoginCreateAPIView.as_view(), name='google-login'),
    path('auth/token/obtain/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),
    path('profile/me/', UserProfileRetrieveAPIView.as_view(), name='user-profile'),
    path('profile/update/', UserUpdateProfileAPIView.as_view(), name='user-profile-update'),
    path('profile/change-password/', UserChangePasswordUpdateAPIView.as_view(), name='user-change-password'),
]
