# API Documentation
**Project Name:** RentEase
**Base URL:** `http://localhost:8000/api/v1`

## 1. Authentication Endpoints
- `POST /auth/register/`: Register a new user (Tenant or Landlord).
- `POST /auth/login/`: Authenticate user and return JWT tokens.
- `POST /auth/refresh/`: Refresh JWT access token.
- `POST /auth/password-reset/`: Generate password reset link and send via email (or return as `dev_reset_link` if SMTP is blocked).
- `POST /auth/password-reset/confirm/`: Confirm password reset using uid and token.

## 2. User Endpoints
- `GET /auth/me/`: Retrieve current user profile.
- `PATCH /auth/me/`: Update user profile.

## 3. Property Endpoints
- `GET /properties/`: List all active properties (supports query filters).
- `GET /properties/{id}/`: Retrieve property details.
- `POST /properties/`: Create a new property (Landlord only).
- `PATCH /properties/{id}/`: Update property (Landlord only).
- `DELETE /properties/{id}/`: Delete property (Landlord only).
- `POST /properties/{id}/images/`: Upload images to a property.

## 4. Booking Endpoints
- `POST /bookings/`: Create a reservation request (Tenant only).
- `GET /bookings/`: List user's bookings (Tenant/Landlord view).
- `PATCH /bookings/{id}/`: Update booking status (e.g., Approve/Reject by Landlord).

## 5. Payment Endpoints
- `POST /payments/create-order/`: Create a Razorpay order for a booking.
- `POST /payments/verify/`: Verify Razorpay payment signature after successful client checkout.

## 6. Chat & Messaging Endpoints
- `GET /chat/conversations/`: List all active conversations for the authenticated user.
- `POST /chat/conversations/`: Create or fetch a conversation with a host for a specific property.
- `GET /chat/conversations/{id}/messages/`: Retrieve message history for a specific conversation.

## 7. WebSocket Routing
- `ws://<domain>/ws/chat/global/`: Connect to the Global Concierge broadcast channel. Messages are intercepted by Google Gemini AI (gemini-2.5-flash) and replied to asynchronously with a Luxury Concierge persona.
- `ws://<domain>/ws/chat/{conversation_id}/`: Connect to a secure, private E2E encrypted room.
