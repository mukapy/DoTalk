from django.urls import path

from categories.views import CategoryListAPIView, TopicListCreateAPIView

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('topics/', TopicListCreateAPIView.as_view(), name='topic-list-create'),
]
