from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework.views import APIView
from django.core.mail import send_mail

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

class PasswordResetView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            frontend_url = 'https://rent-ease-mu.vercel.app'
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            
            try:
                send_mail(
                    'RentEase: Password Recovery',
                    f'Hello {user.first_name},\n\nWe received a request to reset your password. '
                    f'Click the link below to set a new password:\n\n{reset_link}\n\n'
                    'If you did not request this, please ignore this email.',
                    f'RentEase Concierge <{settings.EMAIL_HOST_USER}>',
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Failed to send email: {e}")
                
            return Response({
                'detail': 'Password reset link sent. (Check Network tab or console for the link if email fails)',
                'dev_reset_link': reset_link
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'Password reset link sent to your email.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not uidb64 or not token or not new_password:
             return Response({'detail': 'Missing credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

class ContactUsView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        message = request.data.get('message')

        if not name or not email or not message:
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Send email to the specified admin address
        admin_email = settings.EMAIL_HOST_USER
        subject = f"RentEase Inquiry from {name}"
        body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"

        send_mail(
            subject,
            body,
            f"{name} <{settings.EMAIL_HOST_USER}>", # From email (must be authenticated user for Gmail)
            [admin_email],
            fail_silently=False,
        )

        return Response({'detail': 'Message sent successfully.'}, status=status.HTTP_200_OK)
