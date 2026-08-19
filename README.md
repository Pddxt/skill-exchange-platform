# Barter - Skill Exchange Platform

A production-ready MERN portfolio project. Users list skills they can teach,
book sessions with each other, and pay either with **time-credits** (1 hour
taught = 1 credit, spendable on any other skill) or, if the host opts in,
**real money** via Stripe. Includes auth, search/filtering, booking workflow,
real-time messaging (Socket.io), and a review/rating system.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Socket.io, Stripe
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, Socket.io client

## Project structure

```
skill-exchange-platform/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # Auth guard, error handler
│   ├── models/          # Mongoose schemas (User, Skill, Booking, Message, Review)
│   ├── routes/          # Express routers
│   ├── utils/           # JWT helper, seed script
│   └── server.js        # App entrypoint + Socket.io
└── frontend/
    └── src/
        ├── api/          # Axios instance + API call functions
        ├── components/   # Navbar, Footer, SkillCard, ProtectedRoute
        ├── context/      # AuthContext (global user state)
        ├── hooks/        # useSocket
        └── pages/        # Home, Browse, SkillDetail, SkillForm, Dashboard,
                           # Bookings, Messages, Profile, Login, Register
```

## Setup

### 1. Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a random JWT_SECRET at minimum
npm run seed     # optional: populates 4 demo users + 4 skills
npm run dev      # starts on http://localhost:5000
```

Seeded demo accounts (if you ran `npm run seed`) all use password `password123`:
`asha@example.com`, `liam@example.com`, `mei@example.com`, `noah@example.com`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point to localhost:5000, edit if needed
npm run dev             # starts on http://localhost:5173
```

Open `http://localhost:5173`.

### 4. Payments (optional)

Paid sessions work end-to-end on the backend (Stripe PaymentIntent creation)
once you add real **test** keys from your Stripe dashboard to `backend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Without a key, paid listings still work everywhere except the actual checkout
step, which will return a clear "payments not configured" message instead of
silently failing.

The frontend does not yet include the Stripe Elements card form — see
**Next steps** below.

## How the exchange model works

- Every new user starts with **5 free time-credits**.
- A skill listing is either a **credit swap** (free, costs the learner
  credits) or **paid** (costs real money, set per-hour by the teacher).
- Booking a credit-swap session reserves the credits; they're transferred
  from learner to teacher only once the session is marked **completed**,
  so no one is charged for a no-show that never happened.
- Paid sessions follow the same booking/confirm/complete flow but settle
  through Stripe instead of the credit ledger.
- Only the **learner** can leave a review, and only after the session is
  marked completed.

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/skills` | Browse/search/filter listings |
| POST | `/api/skills` | Create a listing |
| GET/PUT/DELETE | `/api/skills/:id` | View/edit/remove a listing |
| POST | `/api/bookings` | Request a session |
| PUT | `/api/bookings/:id/status` | Confirm / reject / complete / cancel |
| POST | `/api/bookings/:id/pay` | Create Stripe PaymentIntent |
| GET/POST | `/api/messages` | Conversations & sending messages |
| POST | `/api/reviews` | Review a completed session |

All write routes require `Authorization: Bearer <token>`.

## Next steps (not included, by design, to keep this a focused starter)

- Stripe Elements checkout UI on the frontend (backend is ready for it)
- Email notifications (booking confirmed, new message, etc.)
- Image upload for avatars (currently a text URL field)
- Automated tests (Jest/Supertest for API, Vitest/RTL for components)
- Deployment config (the app is platform-agnostic — works on Render/Railway
  + Vercel/Netlify, or a single VPS with Nginx)
