from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/properties/', include('properties.urls')),
    path('api/v1/bookings/', include('bookings.urls')),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/platform-admin/', include('platform_admin.urls')),
]
