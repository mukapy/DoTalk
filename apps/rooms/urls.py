from django.urls import path

from rooms.views import (
    RoomListAPIView,
    RoomCreateAPIView,
    RoomRetrieveAPIView,
    RoomUpdateAPIView,
    RoomDeleteAPIView,
)

urlpatterns = [
    path('', RoomListAPIView.as_view(), name='room-list'),
    path('create/', RoomCreateAPIView.as_view(), name='room-create'),
    path('<uuid:uuid>/', RoomRetrieveAPIView.as_view(), name='room-detail'),
    path('<uuid:uuid>/update/', RoomUpdateAPIView.as_view(), name='room-update'),
    path('<uuid:uuid>/delete/', RoomDeleteAPIView.as_view(), name='room-delete'),
]
