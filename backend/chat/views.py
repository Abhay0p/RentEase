from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(tenant=user) | Q(landlord=user)).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        property_id = request.data.get('property_id')
        if not property_id:
            return Response({'detail': 'Property ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        from properties.models import Property
        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response({'detail': 'Property not found'}, status=status.HTTP_404_NOT_FOUND)

        # Landlords can't start a chat with themselves as a tenant
        if property_obj.landlord == request.user:
            return Response({'detail': 'Landlords cannot initiate conversations on their own property.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure conversation is unique per tenant, landlord, property
        conversation, created = Conversation.objects.get_or_create(
            tenant=request.user,
            landlord=property_obj.landlord,
            property=property_obj
        )

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        
        # Verify user is part of the conversation
        if request.user != conversation.tenant and request.user != conversation.landlord:
            return Response({'detail': 'Not authorized to view these messages.'}, status=status.HTTP_403_FORBIDDEN)

        messages = conversation.messages.all().order_by('created_at')
        
        # Mark messages as read if the current user didn't send them
        unread_messages = messages.exclude(sender=request.user).filter(is_read=False)
        unread_messages.update(is_read=True)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
