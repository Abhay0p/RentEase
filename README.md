# RentEase

RentEase is a full-stack, enterprise-grade property rental SaaS platform designed to connect landlords and tenants through a highly polished, visually premium marketplace. 

This project was built to showcase **Advanced Prompt Engineering** and seamless **LLM Integration** into a modern web stack, featuring a custom 24/7 AI-powered Luxury Concierge.

## 🚀 Key Features

- **AI-Powered Global Concierge:** Real-time WebSocket chat system natively integrated with **Google Gemini 2.5**. The AI is strictly prompt-engineered with a "Luxury Concierge" persona, capable of answering property questions, handling bespoke requests, and responding to users asynchronously without blocking the main event loop.
- **Premium UI/UX:** Built with Next.js App Router, Tailwind CSS, ShadCN, and Framer Motion for a stunning, responsive, and glassmorphic aesthetic inspired by Airbnb and Stripe.
- **Secure Authentication:** Role-based access control (Tenants & Landlords) powered by JWT (JSON Web Tokens), with robust client-side state persistence using Zustand and Axios refresh interceptors.
- **Geolocation & Mapping:** Interactive property discovery using Leaflet / OpenStreetMap, with automatic backend address geocoding via Nominatim API.
- **Automated Bookings & Payments:** Complete reservation system integrated with Razorpay (Test Mode) for secure checkout and payment processing.
- **Media Management:** Direct-to-cloud image uploading using Cloudinary.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, ShadCN UI
- **State Management:** Zustand
- **Real-Time:** Native WebSockets
- **Deployment:** Vercel

### Backend
- **Framework:** Django & Django REST Framework
- **Real-Time:** Django Channels (ASGI) & Redis
- **Database:** PostgreSQL
- **AI Integration:** Google Generative AI SDK (`google-genai`)
- **Deployment:** Render

## 📖 Documentation
Detailed architectural and product documentation can be found in the `docs/` folder:
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [High-Level Design (HLD)](./docs/HLD.md)
- [Low-Level Design (LLD)](./docs/LLD.md)
- [API Documentation](./docs/API_DOCS.md)

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory (see `.env.example` for keys).
```bash
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory.
```bash
npm run dev
```

The platform will be available at `http://localhost:3000`.

---
*Built as a showcase for Prompt Engineering & AI Integration Internships.*
