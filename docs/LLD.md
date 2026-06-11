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
- **Race Condition Mitigations**: Strict boolean flags (`isActive` / `isFetchActive`) are implemented within `useEffect` cleanup functions. This physically prevents delayed network responses or trailing socket messages from overwriting the React state of newly focused chat rooms, ensuring isolated conversation data.
