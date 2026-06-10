from rest_framework import serializers
from .models import Property, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'is_primary']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'landlord', 'landlord_name', 'property_type', 'title', 'description', 
            'address', 'latitude', 'longitude', 'price_per_night', 
            'amenities', 'is_active', 'images', 'created_at'
        ]
        read_only_fields = ['landlord']

    def get_landlord_name(self, obj):
        return f"{obj.landlord.first_name} {obj.landlord.last_name}"
