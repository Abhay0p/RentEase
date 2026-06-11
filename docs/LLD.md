# Low-Level Design (LLD)
**Project Name:** RentEase

## 1. Database Schema (PostgreSQL)

### Table: Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: TENANT, LANDLORD, ADMIN)
- `first_name` (String)
- `last_name` (String)
- `is_verified` (Boolean)
- `created_at` (Timestamp)

### Table: Properties
- `id` (UUID, Primary Key)
- `landlord_id` (UUID, Foreign Key -> Users.id)
- `title` (String)
- `description` (Text)
- `address` (String)
- `latitude` (Float)
- `longitude` (Float)
- `price_per_night` (Decimal)
- `amenities` (JSONB)
- `is_active` (Boolean)

### Table: Bookings
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key -> Properties.id)
- `tenant_id` (UUID, Foreign Key -> Users.id)
- `start_date` (Date)
- `end_date` (Date)
- `total_price` (Decimal)
- `status` (Enum: PENDING, APPROVED, REJECTED, COMPLETED)

### Table: Payments
- `id` (UUID, Primary Key)
- `booking_id` (UUID, Foreign Key -> Bookings.id)
- `amount` (Decimal)
- `razorpay_order_id` (String)
- `razorpay_payment_id` (String)
- `status` (Enum: SUCCESS, FAILED, PENDING)

### Table: Conversations
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key -> Users.id)
- `landlord_id` (UUID, Foreign Key -> Users.id)
- `property_id` (UUID, Foreign Key -> Properties.id)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Table: Messages
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key -> Conversations.id)
- `sender_id` (UUID, Foreign Key -> Users.id)
- `content` (Text)
- `created_at` (Timestamp)

## 2. Frontend Component Tree (Next.js)
```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── landlord/page.tsx
│   │   └── admin/page.tsx
│   ├── properties/
│   │   ├── [id]/page.tsx
│   │   └── search/page.tsx
│   └── page.tsx (Landing)
├── components/
│   ├── ui/ (ShadCN components: Button, Input, Card)
│   ├── layout/ (Navbar, Footer, Sidebar)
│   └── property/ (PropertyCard, MapView)
```

## 3. State Management (Zustand)
- **`authStore.ts`**: Uses `persist` middleware configured with `localStorage` to cryptographically store and rehydrate the `user` object and `isAuthenticated` boolean across hard refreshes and page navigations.

## 4. WebSocket Lifecycle Management
- **Chat Connections**: Component `useEffect` hooks manage standard WebSocket connections (`ws://`). 
- **AI Concierge**: The `ChatConsumer` specifically intercepts the `global` conversation ID. Instead of writing to the DB, it invokes `asyncio.to_thread` to wrap synchronous calls to the `google-genai` SDK, broadcasting the Gemini AI's response asynchronously without blocking other users.
- **Race Condition Mitigations**: Strict boolean flags (`isActive` / `isFetchActive`) are implemented within `useEffect` cleanup functions. This physically prevents delayed network responses or trailing socket messages from overwriting the React state of newly focused chat rooms, ensuring isolated conversation data.

## 5. API Clients & Interceptors
- **Axios Instance**: Centralized API client configured in `frontend/src/lib/axios.ts`.
- **JWT Refresh Interceptor**: A response interceptor actively monitors for `401 Unauthorized` errors. It pauses the failed request, securely retrieves the `refresh_token` from `localStorage`, negotiates a new access token via `/auth/token/refresh/`, and seamlessly replays the original failed request to prevent session drops.

## 6. Geocoding Service
- **Backend View (`perform_create` & `perform_update`)**: Property creation and updates intercept the raw address string.
- **Nominatim Utility**: The string is URL-encoded and sent to OpenStreetMap's Nominatim API with strict `User-Agent` headers. The resulting coordinate mapping is saved directly to the database layer before the ModelSerializer commits.
