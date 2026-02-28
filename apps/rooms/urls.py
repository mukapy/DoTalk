from django.urls import path

from rooms.views import TopicListAPIView, CategoryListAPIView, RoomListAPIView

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('topics/', TopicListAPIView.as_view(), name='topic-list'),
    path('', RoomListAPIView.as_view(), name='room-list'),
]
