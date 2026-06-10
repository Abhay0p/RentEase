from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, PropertyImage
from .serializers import PropertySerializer, PropertyImageSerializer

class IsLandlordOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'LANDLORD'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.landlord == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [IsLandlordOrReadOnly]

    def get_queryset(self):
        queryset = Property.objects.filter(is_active=True).order_by('-created_at')
        
        # Filter by property type
        prop_type = self.request.query_params.get('type', None)
        if prop_type and prop_type.upper() in ['HOTEL', 'VILLA', 'APARTMENT']:
            queryset = queryset.filter(property_type=prop_type.upper())
            
        # Search by location or title
        search_query = self.request.query_params.get('search', None)
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(address__icontains=search_query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties(self, request):
        if request.user.role != 'LANDLORD':
            return Response({'detail': 'Only landlords can view their properties.'}, status=status.HTTP_403_FORBIDDEN)
        queryset = Property.objects.filter(landlord=request.user).order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_image(self, request, pk=None):
        property_obj = self.get_object()
        if property_obj.landlord != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        
        image = request.FILES.get('image')
        is_primary = request.data.get('is_primary', False)
        
        if not image:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        prop_image = PropertyImage.objects.create(
            property=property_obj,
            image=image,
            is_primary=is_primary == 'true' or is_primary is True
        )
        return Response(PropertyImageSerializer(prop_image).data, status=status.HTTP_201_CREATED)
