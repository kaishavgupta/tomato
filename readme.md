# 🍅 Tomato | Real-Time Food Delivery Ecosystem

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61DAFB?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)


**Tomato** is a high-performance, real-time food delivery platform engineered to connect hungry customers, local restaurants, and agile delivery partners seamlessly.

---

## 🏗️ System Architecture & Roles

The platform operates as a tri-factor ecosystem, ensuring efficient communication between three distinct user roles:

### 1. 📱 Users (Customers)
* **Discovery:** Browse and search curated food catalogs.
* **Ordering:** Secure checkout process with live order tracking.
* **Management:** Personal address books and complete order history.
* **Notifications:** Instant updates on order status via web sockets.

### 2. 🍳 Restaurants
* **Menu Management:** Full CRUD operations for food items and categories.
* **Order Control:** Real-time dashboard to accept, prepare, or reject orders.
* **Logistics:** Direct assignment of orders to the nearest available riders.
* **Analytics:** Insights into operational metrics and daily revenue.

### 3. 🚴 Riders (Delivery Partners)
* **Live Requests:** Immediate notification of nearby delivery opportunities.
* **Navigation:** Real-time route optimization for faster fulfillment.
* **Status Updates:** One-tap transitions (Picked Up → In Transit → Delivered).
* **Earnings:** Detailed delivery history and payout tracking.

---

## 🔄 Real-Time Workflow

The application leverages WebSockets to maintain a persistent, live connection throughout the order lifecycle:

> **Customer Order** ➔ **Restaurant Accept** ➔ **Rider Pickup** ➔ **Live Tracking** ➔ **Delivery Complete**

---

## 🔐 Authentication API

Tomato utilizes **Google OAuth 2.0** for a frictionless, secure onboarding experience.

### User Login
`POST /api/auth/login`

**Request Body:**
```json
{
  "code": "authorization_code_from_google"
}

Success Response:JSON{
  "success": true,
  "msg": "Login successful"
}
Role AssignmentPOST /api/auth/roleRequires Authorization: Bearer <jwt_token>Request Body:JSON{
  "role": "user" | "restaurant" | "rider"
}
✨ Key Features

🔐 Google OAuth Integration
Secure, passwordless authentication powered by Google OAuth 2.0.

⚡ Auto-Provisioning
Automatic account creation during first-time login.

🛡️ Security First
Session tokens stored using HTTP-only JWT Cookies for enhanced protection.

👤 Rich Profiles
Automatic synchronization of user name, email, and profile avatar.

🧩 Multi-Role Support
Flexible architecture supporting:

Users

Restaurants

Riders

📍 Live Tracking
Sub-second real-time location updates via WebSockets.

🛠️ Tech Stack
Layer	Technology
Frontend	React, TypeScript, Vite, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB (Mongoose ODM)
Real-Time	Socket.io / WebSockets
Auth	Passport.js / Google OAuth 2.0
🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/tomato.git
cd tomato
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables

Create a .env file in the root directory:

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
4️⃣ Run Development Server
npm run dev