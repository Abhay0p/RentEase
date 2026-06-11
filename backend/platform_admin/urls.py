from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.get_stats, name='admin-stats'),
    path('users/', views.get_users, name='admin-users'),
    path('users/<uuid:pk>/', views.update_user, name='admin-update-user'),
]
