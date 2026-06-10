import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from properties.models import Property

User = get_user_model()

def seed_hotels():
    # Attempt to find the landlord user (create if not exists)
    landlord, created = User.objects.get_or_create(
        email='abhaynarayan0001@gmail.com',
        defaults={
            'first_name': 'Abhay',
            'last_name': 'Narayan',
            'role': 'LANDLORD',
            'is_verified': True
        }
    )
    if not created and landlord.role != 'LANDLORD':
        landlord.role = 'LANDLORD'
        landlord.save()

    hotels_data = [
        {
            'title': 'The Imperial Delhi',
            'description': 'A stunning 5-star hotel offering colonial elegance, modern luxury, and world-class hospitality in the heart of the capital.',
            'address': 'Janpath Ln, Connaught Place, New Delhi, Delhi 110001',
            'latitude': 28.6261,
            'longitude': 77.2185,
            'price_per_night': 450,
            'property_type': 'HOTEL',
            'amenities': ['Spa', 'Pool', 'Fine Dining', 'Concierge']
        },
        {
            'title': 'Jaypee Greens Golf & Spa Resort',
            'description': 'An ultra-luxury resort nestled in the expansive greens of Greater Noida, featuring a championship golf course and an award-winning spa.',
            'address': 'G Block, Surajpur Kasna Road, Greater Noida, Uttar Pradesh 201306',
            'latitude': 28.4682,
            'longitude': 77.5144,
            'price_per_night': 320,
            'property_type': 'HOTEL',
            'amenities': ['Golf Course', 'Spa', 'Pool', 'Fitness Center']
        },
        {
            'title': 'Taj Falaknuma Palace',
            'description': 'Experience the grandeur of the Nizams in this historic palace hotel offering unparalleled luxury and panoramic views of Hyderabad.',
            'address': 'Engine Bowli, Falaknuma, Hyderabad, Telangana 500053',
            'latitude': 17.3308,
            'longitude': 78.4674,
            'price_per_night': 850,
            'property_type': 'HOTEL',
            'amenities': ['Butler Service', 'Royal Dining', 'Heritage Walk', 'Spa']
        },
        {
            'title': 'The Oberoi Grand',
            'description': 'Fondly known as the Grande Dame of Chowringhee, this heritage hotel offers classic luxury and exceptional service in the heart of Kolkata.',
            'address': '15, Jawaharlal Nehru Rd, New Market Area, Dharmatala, Taltala, Kolkata, West Bengal 700013',
            'latitude': 22.5645,
            'longitude': 88.3516,
            'price_per_night': 400,
            'property_type': 'HOTEL',
            'amenities': ['Pool', 'Spa', 'Fine Dining', 'Heritage Architecture']
        },
        {
            'title': 'Rambagh Palace',
            'description': 'Step into the former residence of the Maharaja of Jaipur. This architectural masterpiece offers regal luxury and stunning manicured gardens.',
            'address': 'Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005',
            'latitude': 26.8970,
            'longitude': 75.8078,
            'price_per_night': 1200,
            'property_type': 'HOTEL',
            'amenities': ['Polo Bar', 'Spa', 'Indoor Pool', 'Vintage Car Rides']
        },
        {
            'title': 'Chopta Eco Retreat',
            'description': 'A serene luxury camping and eco-resort experience nestled in the majestic Himalayas, perfect for nature lovers seeking comfort.',
            'address': 'Chopta - Ukhimath Road, Kedarnath Wildlife Sanctuary, Chopta, Uttarakhand 246469',
            'latitude': 30.4851,
            'longitude': 79.1764,
            'price_per_night': 150,
            'property_type': 'HOTEL',
            'amenities': ['Mountain Views', 'Guided Treks', 'Bonfire', 'Eco-friendly']
        }
    ]

    print("Seeding hotels...")
    for data in hotels_data:
        # Avoid duplicating properties with the same title
        if not Property.objects.filter(title=data['title']).exists():
            Property.objects.create(landlord=landlord, **data)
            print(f"Created: {data['title']}")
        else:
            print(f"Already exists: {data['title']}")

if __name__ == '__main__':
    seed_hotels()
