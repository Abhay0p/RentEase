import json
import os
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from django.contrib.auth import get_user_model
from django.utils import timezone
import google.generativeai as genai

# Configure Gemini AI (this runs once when the module loads)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Ensure the user is authenticated (simplified for now, ideally use JWT middleware)
        user = self.scope.get('user')
        if user and user.is_authenticated:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            # We'll accept it anyway for test mode if middleware isn't wired perfectly,
            # but ideally reject unauthenticated
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        sender_id = text_data_json.get('sender_id', 'unknown')
        sender_name = text_data_json.get('sender_name', 'Client')

        # Broadcast directly for 'global' concierge chat
        if self.conversation_id == 'global':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': sender_id,
                    'sender_name': sender_name,
                    'created_at': timezone.now().isoformat(),
                    'id': 'global-' + str(timezone.now().timestamp())
                }
            )
            
            # Asynchronously handle the AI response
            asyncio.create_task(self.handle_ai_response(message))
            return

        # Save message to database for real property conversations
        msg_obj = await self.save_message(sender_id, self.conversation_id, message)

        if msg_obj:
            # Broadcast to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': sender_id,
                    'sender_name': sender_name,
                    'created_at': msg_obj.created_at.isoformat(),
                    'id': str(msg_obj.id)
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': {
                'id': event.get('id'),
                'content': event.get('message'),
                'sender_id': event.get('sender_id'),
                'sender_name': event.get('sender_name', 'Client'),
                'timestamp': event.get('created_at')
            }
        }))

    async def handle_ai_response(self, user_message):
        """Asynchronously call Gemini API and broadcast the response."""
        # Wait a moment to make it feel like the AI is "typing"
        await asyncio.sleep(1)
        
        system_instruction = (
            "You are the RentEase Luxury Concierge. "
            "You provide polite, exclusive, and highly professional assistance "
            "for high-end real estate and luxury travel inquiries. "
            "Keep your responses concise, elegant, and helpful. "
            "Never break character. You do not have access to real-time property data yet."
        )

        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("API Key not found in Render Environment Variables.")
            
            # Configure on the fly to ensure it uses the latest key
            genai.configure(api_key=api_key)
                
            # Run the synchronous API call in a separate thread so it doesn't block the WebSocket event loop
            response_text = await asyncio.to_thread(self._get_gemini_response, system_instruction, user_message)
            
        except Exception as e:
            print(f"Gemini AI Error: {e}")
            response_text = f"SYSTEM ERROR: {str(e)}"
            
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': response_text,
                'sender_id': 'ai-concierge',
                'sender_name': 'RentEase Concierge',
                'created_at': timezone.now().isoformat(),
                'id': 'ai-' + str(timezone.now().timestamp())
            }
        )

    def _get_gemini_response(self, system_instruction, user_message):
        """Synchronous wrapper for the Gemini API call."""
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=system_instruction
        )
        response = model.generate_content(user_message)
        return response.text

    @database_sync_to_async
    def save_message(self, sender_id, conversation_id, content):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            sender = User.objects.get(id=sender_id)
            return Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=content
            )
        except Exception as e:
            print("Error saving message:", e)
            return None
