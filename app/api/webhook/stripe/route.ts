import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { getStripeClient } from "@/lib/stripe";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed.", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    const tokens = Number(session.metadata?.tokens ?? 0);

    if (uid && tokens > 0) {
      const db = getAdminDb();
      const userRef = db.collection("users").doc(uid);
      await userRef.set(
        {
          walkTokens: FieldValue.increment(tokens),
          lastPurchaseAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  return NextResponse.json({ received: true });
}

