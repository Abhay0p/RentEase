from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserDetailView, PasswordResetView, PasswordResetConfirmView, CustomTokenObtainPairView, ContactUsView, make_me_admin

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('make-me-admin/', make_me_admin, name='make_me_admin'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('contact/', ContactUsView.as_view(), name='contact_us'),
]
