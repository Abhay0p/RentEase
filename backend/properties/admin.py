from django.contrib import admin
from .models import Property, PropertyImage

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'landlord', 'price_per_night', 'is_active', 'created_at')
    list_filter = ('is_active', 'property_type')
    search_fields = ('title', 'address', 'description')
    inlines = [PropertyImageInline]
    
@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'image_url', 'created_at')
