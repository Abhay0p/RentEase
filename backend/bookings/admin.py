from django.contrib import admin
from .models import Booking, Payment

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'tenant', 'check_in', 'check_out', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('property__title', 'tenant__email')
    
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'status', 'razorpay_order_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('razorpay_order_id', 'razorpay_payment_id', 'booking__id')
