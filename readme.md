# 🍅 Tomato | Real-Time Food Delivery Ecosystem

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61DAFB?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Google%20OAuth-orange?logo=jsonwebtokens)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary)](https://cloudinary.com/)

**Tomato** is a high-performance, real-time food delivery platform engineered to connect hungry customers, local restaurants, and agile delivery partners seamlessly.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│              React Query + Protected Routes             │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────┐   ┌────────────────────────────────┐
│  User Service      │   │     Restaurant Service         │
│  :3001             │   │     :3003                      │
│  /api/auth/*       │   │     /api/auth/*                │
│                    │   │     /api/menu/*                │
└────────────┬───────┘   └──────────────┬────────────────┘
             │                          │
             └──────────┬───────────────┘
                        ▼
             ┌─────────────────────┐
             │   Utils Service     │
             │   Cloudinary Upload │
             │   /api/upload       │
             │   /api/delete/:id   │
             └─────────────────────┘
```

---

## 🔐 Authentication & Token System

Tomato uses **Google OAuth 2.0** for login and **HTTP-only JWT cookies** for session management.

### Cookie Name: `Tomato_user`
| Property | Value |
|---|---|
| Format | `Bearer <jwt_token>` |
| Storage | HTTP-only cookie |
| Expiry | 15 days (JWT) / ~25 hours (cookie maxAge) |
| sameSite | `lax` |

### JWT Payload — User Token
```json
{
  "id": "<user._id>",
  "user": "user | restaurant | rider | null",
  "iat": ...,
  "exp": ...
}
```

### JWT Payload — Restaurant Token
```json
{
  "id": "<restaurant.ownerId>",
  "user": "restaurant",
  "restaurant_id": "<restaurant._id>",
  "iat": ...,
  "exp": ...
}
```

### JWT Payload — After Restaurant Deletion
Cookie is **cleared entirely** via `clearCookie()` — no new token is issued.

---

## 👤 User Service — `localhost:3001`

Base path: `/api/auth`

### Middleware

| Middleware | File | Description |
|---|---|---|
| `isAuth` | `isAuth.middleware.ts` | Verifies `Tomato_user` cookie, decodes JWT, attaches `req.user` |

---

### `POST /api/auth/login`

Exchanges a Google OAuth authorization code for a session cookie.

**Request Body:**
```json
{ "code": "authorization_code_from_google" }
```

**Flow:**
1. Exchanges `code` for Google tokens via `oauth2client.getToken()`
2. Fetches user profile from Google (`name`, `email`, `picture`)
3. Creates user in MongoDB if first-time login
4. Issues JWT and sets `Tomato_user` cookie

**Success Response `200`:**
```json
{ "success": true, "msg": "Login successful" }
```

**Error Response `400`:**
```json
{ "success": false, "msg": "Authorization code is required" }
```

---

### `POST /api/auth/add_role` 🔒

Assigns a role to the logged-in user. Requires `isAuth` middleware.

**Request Body:**
```json
{ "role": "user" | "restaurant" | "rider" }
```

**Flow:**
1. Validates role is one of the three allowed values
2. Updates `user.role` in MongoDB via `findByIdAndUpdate`
3. Re-issues JWT with updated role and refreshes cookie

**Success Response `200`:**
```json
{ "success": true, "msg": "Successfully added role" }
```

**Error Responses:**
```json
{ "success": false, "msg": "Not allowed" }          // 401 — invalid role
{ "success": false, "msg": "User not Found" }        // 404
{ "success": false, "msg": "Unatuthorised Can't add roles" }  // 401
```

---

### `GET /api/auth/user_profile` 🔒

Returns the authenticated user's profile. Requires `isAuth` middleware.

**Success Response `200`:**
```json
{
  "success": true,
  "msg": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "image": "https://...",
    "role": "restaurant"
  }
}
```
> `createdAt`, `updatedAt`, `__v` are excluded from the response.

---

## 🍳 Restaurant Service — `localhost:3003`

Base path: `/api/auth`

### Middleware

| Middleware | File | Description |
|---|---|---|
| `isAuth` | `isauth.middleware.ts` | Decodes JWT, attaches `req.user` with `_id`, `role`, `restaurant_id` |
| `isRestaurant` | `isauth.middleware.ts` | Checks `req.user.role === "restaurant"` AND `restaurant_id` exists in token |
| `uploadFile` | `multer.middleware.ts` | Handles `multipart/form-data` for image uploads |

> ⚠️ `isRestaurant` will reject requests with `403` if `restaurant_id` is missing from the JWT (i.e. restaurant not created yet).

---

### `POST /api/auth/new-restaurant` 🔒

Creates a new restaurant. Requires `isAuth` + `uploadFile`.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `email` | string | ✅ |
| `phone` | string | ✅ |
| `latitude` | string | ✅ |
| `longitude` | string | ✅ |
| `formatedAddress` | string | ✅ |
| `description` | string | ❌ |
| `file` | image | ✅ |

**Flow:**
1. Checks user is authenticated and has a role
2. Checks no restaurant already exists for this owner
3. Uploads image to Cloudinary via Utils Service
4. Creates restaurant document in MongoDB
5. Issues new **restaurant JWT** (includes `restaurant_id`) and sets cookie

**Success Response `201`:**
```json
{ "success": true, "msg": "Restaurant added successfully" }
```

**Error Responses:**
```json
{ "success": false, "msg": "You Already have a restaurant" }   // 400
{ "success": false, "msg": "Please give all details" }         // 400
{ "success": false, "msg": "Restaurant Image not found" }      // 400
```

---

### `GET /api/auth/my-restaurant` 🔒

Fetches the authenticated owner's restaurant. Requires `isAuth`.

**Flow:**
1. Looks up restaurant by `ownerId` from JWT
2. Refreshes cookie on every successful fetch (token rotation)

**Success Response `200`:**
```json
{
  "success": true,
  "msg": { ...restaurantDocument }
}
```

**Error Response `400`:**
```json
{ "success": false, "msg": "Invalid Restaurant or restaurant not found" }
```

---

### `POST /api/auth/close-restaurant` 🔒🍳

Opens or closes the restaurant for orders. Requires `isAuth` + `isRestaurant`.

**Request Body:**
```json
{ "open": true | false }
```

**Guards:**
- Restaurant must be verified (`isVerified: true`)
- Restaurant must not be paused (`pauseRestaurent: false`)

**Success Response `200`:**
```json
{ "success": true, "msg": "Your restaurant is Open Now" }
// or
{ "success": true, "msg": "Your restaurant is Closed Now" }
```

**Error Responses:**
```json
{ "success": false, "msg": "Your Restaurant is not verified yet" }              // 401
{ "success": false, "msg": "Your Restaurant is Currently Paused..." }           // 401
```

---

### `PATCH /api/auth/restaurent_update` 🔒🍳

Updates restaurant profile fields and/or image. Requires `isAuth` + `isRestaurant` + `uploadFile`.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `name` | string | ❌ |
| `email` | string | ❌ |
| `phone` | string | ❌ |
| `description` | string | ❌ |
| `file` | image | ❌ |

> Only provided fields are updated — partial updates supported.

**Success Response `200`:**
```json
{ "success": true, "msg": { ...updatedRestaurantDocument } }
```

---

### `PATCH /api/auth/pause-Restaurent` 🔒🍳

Pauses or resumes the restaurant (hides from customers without deleting). Requires `isAuth` + `isRestaurant`.

**Request Body:**
```json
{ "pauseRestaurent": true | false }
```

**Success Response `200`:**
```json
{ "success": true, "msg": "Your Restaurant is Paused" }
// or
{ "success": true, "msg": "Your Restaurant is Resumed" }
```

---

### `DELETE /api/auth/delete-restaurent/:public_id` 🔒🍳

Permanently deletes the restaurant and its Cloudinary image. Requires `isAuth` + `isRestaurant`.

**Route Param:** `:public_id` — Cloudinary `public_id` of the restaurant image

**Flow:**
1. Deletes image from Cloudinary via Utils Service
2. Deletes restaurant document from MongoDB
3. **Clears `Tomato_user` cookie entirely** — user must re-authenticate

**Success Response `200`:**
```json
{ "success": true, "msg": "Your restaurant is Permanently Deleted from our DataBase" }
```

**Error Responses:**
```json
{ "success": false, "msg": "Can't Delete, try again" }                          // 400 — Cloudinary failure
{ "success": false, "msg": "Restaurant not Found or Already Deleted" }          // 401
```

---

## ☁️ Utils Service (Cloudinary)

Internal service called by the Restaurant Service only — not exposed to the frontend.

### `POST /api/upload`
Uploads a base64-encoded image to Cloudinary.

**Request Body:**
```json
{ "fileBuffer": "data:image/jpeg;base64,..." }
```

**Response:**
```json
{
  "success": true,
  "msg": { "url": "https://res.cloudinary.com/...", "public_id": "abc123" }
}
```

### `DELETE /api/delete/:publicId`
Deletes an image from Cloudinary by its public ID.

**Response:** `"Image deleted successfully"`

---

## 🛡️ Frontend Route Protection

Managed by `ProtectedRoute.tsx` using React Router `<Outlet />` + React Query state.

### Role-Based Route Map

| Role | Allowed Paths | Blocked Paths |
|---|---|---|
| `null` (no role) | `/select-role` only | Everything else → `/select-role` |
| `user` | `/`, `/menu`, `/orders`, `/track`, `/cart` | All restaurant + rider paths → `/` |
| `restaurant` | `/restaurant`, `/restaurant/menu`, `/restaurant/orders`, `/restaurant/create` | All user + rider paths → `/restaurant` |
| `rider` | `/rider`, `/rider/deliveries` | All user + restaurant paths → `/rider` |

---

### Restaurant Sub-Route Rules

```
role === "restaurant"
│
├── isRestaurantExist === false
│   ├── /restaurant/create     → ✅ ALLOW
│   └── any other path         → 🔄 REDIRECT to /restaurant/create
│
└── isRestaurantExist === true
    ├── /restaurant/create     → 🔄 REDIRECT to /restaurant  (already created)
    └── /restaurant/**         → ✅ ALLOW
```

---

### Loading Strategy

The `ProtectedRoute` waits for **both** the user query and the restaurant query to resolve before making any routing decisions.

```
isLoading (user) OR isRestaurantLoading (restaurant role)
  → Show 🍅 branded spinner
  → No redirect fired until data settles
```

This prevents the **flash-redirect bug** where `isRestaurantExist` is briefly `false` on first render (before the fetch completes), causing existing restaurant owners to be incorrectly bounced to `/restaurant/create`.

---

### Full Decision Flow

```
Request hits ProtectedRoute
│
├── isLoading?                     → 🍅 Spinner
├── !isauth?                       → /login
├── role === null?                 → /select-role
├── role set + path === /select-role? → roleHome(role)
│
├── role === "restaurant"
│   ├── path is user/rider route?  → /restaurant or /restaurant/create
│   ├── no restaurant + not /create → /restaurant/create
│   └── has restaurant + at /create → /restaurant
│
├── role === "user"
│   └── path is restaurant/rider?  → /
│
├── role === "rider"
│   └── path is user/restaurant?   → /rider
│
└── ✅ <Outlet /> — render the page
```

---

## 🗄️ Data Models

### User Model (`user` collection)

| Field | Type | Notes |
|---|---|---|
| `name` | String | From Google profile |
| `email` | String | Unique |
| `image` | String | Google avatar URL |
| `role` | String | `"user"` \| `"restaurant"` \| `"rider"` \| `null` |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Restaurant Model (`restaurant` collection)

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | Ref → `user` |
| `name` | String | Required |
| `email` | String | Unique |
| `phone` | String | Unique |
| `description` | String | Optional |
| `image.url` | String | Cloudinary URL |
| `image.public_id` | String | Cloudinary public ID (used for deletion) |
| `cusiene` | Enum | Indian, Chinese, Italian… |
| `isVerified` | Boolean | Default `false` — set by admin |
| `isOpen` | Boolean | Default `false` |
| `pauseRestaurent` | Boolean | Default `false` |
| `autoLocation.coordinates` | [lng, lat] | GeoJSON Point (2dsphere indexed) |
| `autoLocation.formatedAddress` | String | Human-readable address |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/tomato.git
cd tomato
```

### 2. Environment Variables

**User Service** (port 3001):
```env
URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3001
```

**Restaurant Service** (port 3003):
```env
URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret   # must match User Service
UTILS_SERVICE=http://localhost:3004
PORT=3003
```

**Utils Service** (port 3004):
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=3004
```

### 3. Install & Run
```bash
# in each service folder
npm install
npm run dev
```

### 4. Frontend
```bash
cd client
npm install
npm run dev
# runs on http://localhost:5173
```

---

## 🔑 Key Design Decisions

| Decision | Reason |
|---|---|
| Two separate JWT tokens (user vs restaurant) | Restaurant token carries `restaurant_id` — avoids an extra DB lookup on every authenticated restaurant request |
| Cookie cleared (not replaced) on restaurant delete | Issuing a stale token after deletion is a security risk; the user must re-authenticate |
| `isRestaurantLoading` included in route guard | Prevents flash-redirect to `/restaurant/create` before the fetch resolves |
| `queryClient.clear()` on delete (not `invalidateQueries`) | Ensures no stale restaurant/user data lingers in React Query memory after account deletion |
| `restaurant_id` in route param for delete (not body) | HTTP DELETE requests don't reliably carry a body — route params are the correct REST approach |