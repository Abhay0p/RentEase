import os
import django
import sys
import urllib.request
import urllib.parse
import json
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from properties.models import Property

def geocode_address(address):
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={urllib.parse.quote(address)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'RentEase/1.0 (contact@rentease.com)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data and len(data) > 0:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Geocoding failed for {address}: {e}")
    return None, None

props = Property.objects.all()
for p in props:
    if p.latitude == 40.7128 and p.longitude == -74.0060 or p.latitude == 0.0 or p.latitude == 37.7749:
        print(f"Geocoding {p.address}...")
        lat, lon = geocode_address(p.address)
        if lat and lon:
            p.latitude = lat
            p.longitude = lon
            p.save()
            print(f"Saved {p.title} at {lat}, {lon}")
            time.sleep(1) # Nominatim rate limit 1 req/sec
