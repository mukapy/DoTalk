from django.urls import path

from rooms.views import (
    RoomListCreateAPIView,
    RoomRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path('', RoomListCreateAPIView.as_view(), name='room-list-create'),
    path('<uuid:uuid>/', RoomRetrieveUpdateDestroyAPIView.as_view(), name='room-detail'),
]
