from django.contrib import admin
from .models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'landlord', 'property', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('tenant__email', 'landlord__email', 'property__title')
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'sender__email')
