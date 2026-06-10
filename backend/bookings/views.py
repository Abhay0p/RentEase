import hmac
import hashlib
import razorpay
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking, Payment
from properties.models import Property
from .serializers import BookingSerializer

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'LANDLORD':
            return Booking.objects.filter(property__landlord=user).order_by('-created_at')
        return Booking.objects.filter(tenant=user).order_by('-created_at')

    def perform_create(self, serializer):
        property_obj = serializer.validated_data['property']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        
        # Calculate days
        days = (check_out - check_in).days
        total_price = property_obj.price_per_night * days
        
        serializer.save(tenant=self.request.user, total_price=total_price)

    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        booking = self.get_object()
        
        if booking.tenant != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
        if hasattr(booking, 'payment') and booking.payment.status == 'SUCCESS':
            return Response({'detail': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Razorpay Order
        amount_in_paise = int(booking.total_price * 100)
        
        try:
            order_data = {
                'amount': amount_in_paise,
                'currency': 'INR', # Using INR enables native UPI support in Razorpay
                'receipt': str(booking.id)[:40]
            }
            razorpay_order = client.order.create(data=order_data)
            
            payment, created = Payment.objects.get_or_create(
                booking=booking,
                defaults={
                    'razorpay_order_id': razorpay_order['id'],
                    'amount': booking.total_price
                }
            )
            
            if not created and payment.status == 'PENDING':
                payment.razorpay_order_id = razorpay_order['id']
                payment.save()
                
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID
            })
            
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        booking = self.get_object()
        payment = booking.payment
        
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        if payment.razorpay_order_id != razorpay_order_id:
            return Response({'detail': 'Order ID mismatch.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'SUCCESS'
            payment.save()
            
            booking.status = 'CONFIRMED'
            booking.save()
            
            return Response({'detail': 'Payment successful and booking confirmed.'})
            
        except razorpay.errors.SignatureVerificationError:
            payment.status = 'FAILED'
            payment.save()
            return Response({'detail': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
