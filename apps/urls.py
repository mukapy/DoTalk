from django.urls import include, path

urlpatterns = [
    path('payments/', include('payments.urls')),
    path('users/', include('users.urls')),
    path('rooms/', include('rooms.urls')),
    path('posts/', include('posts.urls')),
]
