from django.urls import path

from users.views import RegisterCreateAPIView, GoogleLoginCreateAPIView, CustomTokenObtainPairView, \
    CustomTokenRefreshView, UserCheckEmailAPIView, UserProfileRetrieveAPIView

urlpatterns = [
    path('auth/check-email/<str:email>/', UserCheckEmailAPIView.as_view(), name='check-email'),
    path('auth/register/', RegisterCreateAPIView.as_view(), name='register'),
    path('auth/google/', GoogleLoginCreateAPIView.as_view(), name='google-login'),
    path('auth/token/obtain/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('profile/me/', UserProfileRetrieveAPIView.as_view(), name='user-profile'),
]
