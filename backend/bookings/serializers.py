from rest_framework import serializers
from .models import Booking, Payment
from properties.serializers import PropertySerializer

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['booking', 'amount', 'status', 'razorpay_order_id']

class BookingSerializer(serializers.ModelSerializer):
    property_details = PropertySerializer(source='property', read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_details', 'check_in', 'check_out', 
            'total_price', 'status', 'payment', 'created_at'
        ]
        read_only_fields = ['tenant', 'total_price', 'status']

    def validate(self, data):
        if data['check_in'] >= data['check_out']:
            raise serializers.ValidationError("Check-out must be after check-in.")
        return data
