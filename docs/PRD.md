# Product Requirements Document (PRD)
**Project Name:** RentEase
**Version:** 1.0
**Date:** June 2026

## 1. Product Overview
RentEase is a full-stack SaaS property rental platform designed to connect landlords and tenants through a highly polished, visually premium, and secure marketplace.

## 2. Target Audience
- **Tenants:** Individuals looking for short-term or long-term rental properties with a seamless booking experience.
- **Landlords:** Property owners looking to list properties, manage availability, and securely receive payments.

## 3. Core Features
- **User Authentication:** Role-based access (Tenant, Landlord) with JWT security and persistent Next.js Zustand global state. Includes secure password recovery flows via email SMTP (with Developer Preview fail-safes).
- **Property Discovery:** Map-based (Leaflet / OpenStreetMap) and grid-based search with advanced filtering (hotels, villas, pricing, amenities). Properties are automatically geocoded on the backend via Nominatim upon creation.
- **Property Management:** Dedicated Landlord dashboard to create listings seamlessly and bypass external Cloudinary presets securely via backend uploading.
- **Booking System:** Calendar availability, reservation workflows.
- **Payments:** Secure checkout using Razorpay (Test Mode) and UPI infrastructure logic.
- **Private Host-Guest Messaging:** Real-time, split-pane WebSocket chat system with isolated E2E channels and an AI-Powered Global Concierge (Google Gemini 2.5) serving as a 24/7 smart fallback.
- **Diagnostic Systems:** Robust console logging and asynchronous network timeout handling for debugging cloud environment bottlenecks.

## 4. UI/UX Requirements
- **Aesthetic:** Premium, enterprise-grade, blending styles from Airbnb, Stripe, and Linear.
- **Components:** Glass overlays, soft shadows, rounded corners, professional typography (Inter/Plus Jakarta Sans).
- **Responsiveness:** Mobile-first design, flawless across all screen sizes.
- **Performance:** High Lighthouse scores, optimized images, lazy loading.

## 5. Deployment Requirements
- **Frontend:** Deployed on Vercel.
- **Backend:** Deployed on Render.
