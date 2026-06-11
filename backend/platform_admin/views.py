from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .permissions import IsAdminUser
from django.contrib.auth import get_user_model
from properties.models import Property
from bookings.models import Booking
from django.db.models import Sum

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_stats(request):
    total_users = User.objects.count()
    active_properties = Property.objects.filter(is_active=True).count()
    total_bookings = Booking.objects.count()
    
    # Calculate total revenue from SUCCESSFUL payments
    # Assuming payment model exists in bookings or just sum bookings if APPROVED/COMPLETED
    # Let's check Bookings with status completed
    revenue = Booking.objects.filter(status__in=['APPROVED', 'COMPLETED']).aggregate(Sum('total_price'))['total_price__sum'] or 0

    return Response({
        'total_users': total_users,
        'active_properties': active_properties,
        'total_bookings': total_bookings,
        'total_revenue': float(revenue)
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    users = User.objects.all().order_by('-date_joined')
    data = []
    for user in users:
        data.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_verified': user.is_verified,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None
        })
    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Allow toggling is_verified
    if 'is_verified' in request.data:
        user.is_verified = request.data['is_verified']
    
    if 'role' in request.data:
        user.role = request.data['role']
        
    user.save()
    
    return Response({
        'id': user.id,
        'email': user.email,
        'is_verified': user.is_verified,
        'role': user.role
    })
