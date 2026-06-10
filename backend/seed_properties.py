import os
import django
import uuid
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()

def seed():
    # Get or create a landlord user
    landlord, created = User.objects.get_or_create(
        email="landlord@rentease.com",
        defaults={
            "first_name": "Luxury",
            "last_name": "Host",
            "role": "LANDLORD",
            "is_verified": True
        }
    )
    
    if created:
        landlord.set_password("password123")
        landlord.save()
        print("Created landlord user.")

    # Luxury properties to seed
    properties = [
        {
            "title": "The Manhattan Glass Penthouse",
            "description": "An ultra-modern glass penthouse hovering over Central Park with unobstructed views of the New York skyline.",
            "address": "Central Park South, New York, NY",
            "latitude": 40.7648,
            "longitude": -73.9745,
            "price_per_night": 3500.00,
            "amenities": ["Private Infinity Pool", "24/7 Concierge", "Helipad Access", "Smart Home System"]
        },
        {
            "title": "Malibu Cliffside Brutalist Villa",
            "description": "An architectural masterpiece in Malibu featuring brutalist concrete structures and a cantilevered pool over the Pacific.",
            "address": "Pacific Coast Highway, Malibu, CA",
            "latitude": 34.0259,
            "longitude": -118.7798,
            "price_per_night": 5200.00,
            "amenities": ["Private Beach", "Home Theater", "Wine Cellar", "Ocean Views"]
        },
        {
            "title": "London Mayfair Townhouse",
            "description": "A deeply elegant, meticulously restored historical townhouse in the heart of Mayfair, featuring bespoke interior design.",
            "address": "Mayfair, London, UK",
            "latitude": 51.5085,
            "longitude": -0.1472,
            "price_per_night": 2800.00,
            "amenities": ["Private Garden", "Chef's Kitchen", "Spa", "Library"]
        },
        {
            "title": "Tokyo Skytop Residence",
            "description": "A minimalist haven high above the bustling streets of Roppongi, featuring Zen gardens and floor-to-ceiling glass.",
            "address": "Roppongi Hills, Tokyo, Japan",
            "latitude": 35.6605,
            "longitude": 139.7291,
            "price_per_night": 1900.00,
            "amenities": ["Zen Garden", "Onsen", "Panoramic City Views", "Tea Room"]
        },
        {
            "title": "Lake Como Waterfront Estate",
            "description": "A classic Italian villa modernized for contemporary luxury, featuring direct lake access and private boat mooring.",
            "address": "Bellagio, Lake Como, Italy",
            "latitude": 45.9868,
            "longitude": 9.2618,
            "price_per_night": 4500.00,
            "amenities": ["Private Boat Dock", "Tennis Court", "Heated Pool", "Wine Tasting Room"]
        }
    ]

    print("Seeding luxury properties...")
    for prop_data in properties:
        Property.objects.get_or_create(
            title=prop_data["title"],
            defaults={
                "landlord": landlord,
                "description": prop_data["description"],
                "address": prop_data["address"],
                "latitude": prop_data["latitude"],
                "longitude": prop_data["longitude"],
                "price_per_night": prop_data["price_per_night"],
                "amenities": prop_data["amenities"],
                "is_active": True
            }
        )
    print(f"Successfully seeded {len(properties)} properties.")

if __name__ == "__main__":
    seed()
