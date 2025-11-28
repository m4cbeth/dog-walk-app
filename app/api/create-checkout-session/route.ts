import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { resolveWalkSubscription } from "@/lib/walkPacks";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

interface CheckoutRequestBody {
  subscriptionId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice("Bearer ".length);
    const decoded = await verifyFirebaseIdToken(idToken);

    const body = (await request.json()) as CheckoutRequestBody;
    const subscription = resolveWalkSubscription(body.subscriptionId);
    if (!subscription) {
      return NextResponse.json(
        { error: "Invalid subscription" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const origin =
      request.headers.get("origin") ??
      new URL(request.url).origin;

    // For subscriptions, we need to get the default price from the product
    const product = await stripe.products.retrieve(subscription.stripeProductId);
    const prices = await stripe.prices.list({
      product: subscription.stripeProductId,
      active: true,
      type: 'recurring',
    });

    if (prices.data.length === 0) {
      return NextResponse.json(
        { error: "No active price found for this product" },
        { status: 400 }
      );
    }

    const priceId = prices.data[0]!.id;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url:
        body.successUrl ??
        `${origin}/dashboard?checkout=success&subscription=${subscription.id}`,
      cancel_url:
        body.cancelUrl ??
        `${origin}/dashboard?checkout=cancelled`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: decoded.email ?? undefined,
      metadata: {
        uid: decoded.uid,
        walksPerWeek: String(subscription.walksPerWeek),
        subscriptionId: subscription.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}