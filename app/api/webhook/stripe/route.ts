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

  // Handle subscription created/updated
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    const walksPerWeek = Number(session.metadata?.walksPerWeek ?? 0);
    const subscriptionId = session.metadata?.subscriptionId;

    if (uid && subscriptionId && session.mode === "subscription") {
      const db = getAdminDb();
      const userRef = db.collection("users").doc(uid);
      
      // Update user with subscription info
      await userRef.update({
        walksPerWeek: walksPerWeek || 1,
        subscriptionId: session.subscription as string,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  // Handle subscription updates
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    // You can add logic here to handle subscription changes
    // For now, we'll just log it
    console.log("Subscription updated:", subscription.id);
  }

  return NextResponse.json({ received: true });
}