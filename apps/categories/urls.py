from django.urls import path

from categories.views import (
    CategoryListAPIView,
    TopicListCreateAPIView,
    TopicRequestCreateAPIView,
    TopicRequestModeratorListAPIView,
    TopicRequestReviewUpdateAPIView,
)

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('topics/', TopicListCreateAPIView.as_view(), name='topic-list-create'),

    # User: submit a topic request and view own requests
    path('topic-requests/', TopicRequestCreateAPIView.as_view(), name='topic-request-create'),

    # Moderator/Admin: view all topic requests (default: pending, filterable by ?status=)
    path('topic-requests/review/', TopicRequestModeratorListAPIView.as_view(), name='topic-request-review-list'),

    # Moderator/Admin: approve or reject a specific topic request
    path('topic-requests/review/<int:pk>/', TopicRequestReviewUpdateAPIView.as_view(), name='topic-request-review'),
]
