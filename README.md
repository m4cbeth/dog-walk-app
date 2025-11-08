## Dog Walk App

An end-to-end dog-walking booking MVP built with Next.js App Router, TailwindCSS + daisyUI, Firebase Auth/Firestore, and Stripe for token-based payments.

- Sign up with email/password and manage dog + owner profile details
- Toggle dark/light mode globally (Tailwind + next-themes)
- Purchase walk-token packs via Stripe Checkout; webhook increments Firestore tokens
- Book 15-minute walk slots (12 PM – 12 AM) with real-time availability and token deduction
- Admins see upcoming walks, owners view tokens, and everyone stays informed

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, daisyUI, next-themes
- **Auth & Data:** Firebase Authentication + Firestore (client + Admin SDK)
- **Payments:** Stripe Checkout + webhook handler
- **Tooling:** Turbopack dev server, ESLint 9, TypeScript strict mode

## Prerequisites

- Node.js 18+ (Vercel/Next.js requirement)
- Stripe account with Checkout enabled
- Firebase project with Email/Password auth and Firestore enabled

## Environment Variables

Copy `env.example` to `.env.local` (or the environment file you deploy with) and fill in the values:

```bash
cp env.example .env.local
```

Key variables you will need:

| Key | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Standard Firebase web SDK config |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side usage |
| `STRIPE_SECRET_KEY` | Stripe secret key for server Checkout creation |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint |
| `STRIPE_PRICE_PACK_5`, `STRIPE_PRICE_PACK_10` | Price IDs for each walk pack |
| `FIREBASE_ADMIN_*` | Service account credentials for Firebase Admin SDK |
| `ADMIN_EMAILS`, `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-delimited admin email list for backend + client |

> **Private keys:** remember to escape newline characters in `FIREBASE_ADMIN_PRIVATE_KEY` by replacing actual newlines with `\n`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.
3. Lint the project:
   ```bash
   npm run lint
   ```

## Firebase Configuration

1. Enable Email/Password auth in the Firebase Console.
2. Create a Firestore database in **Native mode**.
3. Download a service account JSON (Project settings → Service accounts) and use its fields for the `FIREBASE_ADMIN_*` variables.
4. Update security rules as you move toward production—this MVP relies on backend enforcement via the Admin SDK.

## Stripe Configuration

1. Create two products with prices:
   - 5 walks (`STRIPE_PRICE_PACK_5`)
   - 10 walks (`STRIPE_PRICE_PACK_10`)
2. Copy the price IDs to your env file.
3. Create a webhook endpoint pointing to `/api/webhook` and subscribe to `checkout.session.completed`. Use the generated signing secret for `STRIPE_WEBHOOK_SECRET`.
4. Configure the **success** and **cancel** URLs if you customise the flow (defaults resolve automatically).

## Admin Access

Add comma-separated admin emails to both `ADMIN_EMAILS` (server) and `NEXT_PUBLIC_ADMIN_EMAILS` (client). Admin users gain access to `Admin → Upcoming Walks`.

## Deployment

- **Vercel:** Add all env variables in the project settings → Environment Variables. Deployments automatically run `npm run build`.
- **Firebase Hosting:** Build locally (`npm run build`) and deploy the `.next` output with the Firebase CLI. Ensure Cloud Functions/Run or another secured environment hosts the Stripe webhook if not deploying on Vercel.

Remember to set the Stripe webhook URL to your production domain once deployed.

## Project Structure Highlights

- `app/` – App Router routes (landing, auth, dashboard, admin, API handlers)
- `components/` – Reusable UI (theme toggle, booking calendar, header, walk pack purchase)
- `context/AuthContext.tsx` – Firebase auth state + helper actions
- `lib/` – Firebase client/admin initializers, Stripe client, walk-pack config
- `types/` – Shared TypeScript interfaces

## Core Workflows

1. **Signup/Login:** AuthContext wraps the app, exposing signup/login/logout helpers and user profile data stored in Firestore.
2. **Token Purchases:** `WalkPackPurchase` hits `/api/create-checkout-session`; Stripe metadata carries the user ID. Webhook increments `walkTokens` on payment success.
3. **Booking:** `BookingCalendar` fetches availability, books slots via `/api/bookings` (with Firebase ID token auth), and updates tokens + Firestore in a transaction.
4. **Admin Schedule:** Admins view upcoming walks through `/admin/bookings`, backed by the same API with elevated checks.

Happy walking!
