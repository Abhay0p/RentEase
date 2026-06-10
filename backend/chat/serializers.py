from rest_framework import serializers
from .models import Conversation, Message
from users.serializers import UserSerializer
from properties.serializers import PropertySerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['sender']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}"

class ConversationSerializer(serializers.ModelSerializer):
    tenant_details = UserSerializer(source='tenant', read_only=True)
    landlord_details = UserSerializer(source='landlord', read_only=True)
    property_details = PropertySerializer(source='property', read_only=True)
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'tenant', 'landlord', 'property', 'tenant_details', 'landlord_details', 'property_details', 'latest_message', 'created_at', 'updated_at']

    def get_latest_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg).data
        return None
