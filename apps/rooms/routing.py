from django.urls import re_path

from rooms.consumers import VideoChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/rooms/(?P<room_uuid>[0-9a-f-]+)/$', VideoChatConsumer.as_asgi()),
]
