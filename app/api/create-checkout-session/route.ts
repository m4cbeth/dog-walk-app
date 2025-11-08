import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { resolveWalkPack } from "@/lib/walkPacks";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

interface CheckoutRequestBody {
  packId: string;
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
    const pack = resolveWalkPack(body.packId);
    if (!pack) {
      return NextResponse.json(
        { error: "Invalid walk pack" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const origin =
      request.headers.get("origin") ??
      new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url:
        body.successUrl ??
        `${origin}/dashboard?checkout=success&pack=${pack.id}`,
      cancel_url:
        body.cancelUrl ??
        `${origin}/dashboard?checkout=cancelled`,
      line_items: [
        {
          price: pack.stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: decoded.email ?? undefined,
      metadata: {
        uid: decoded.uid,
        tokens: String(pack.tokens),
        packId: pack.id,
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

