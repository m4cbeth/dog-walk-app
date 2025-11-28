"use client";

import { useState } from "react";
import { WALK_SUBSCRIPTIONS } from "@/lib/walkPacks";
import { useAuth } from "@/context/AuthContext";

export function WalkPackPurchase() {
  const { getIdToken, user } = useAuth();
  const [loadingSubscription, setLoadingSubscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (subscriptionId: string) => {
    setLoadingSubscription(subscriptionId);
    setError(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }
      window.location.href = data.url as string;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start checkout."
      );
    } finally {
      setLoadingSubscription(null);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-info">
        <span>Sign in to purchase subscriptions.</span>
      </div>
    );
  }

  if (!user.isVetted) {
    return (
      <div className="alert alert-info">
        <span>Complete your free walk to subscribe to a plan.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {WALK_SUBSCRIPTIONS.map((subscription) => (
          <div
            key={subscription.id}
            className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{subscription.name}</h3>
            <p className="text-sm text-base-content/70">
              {subscription.walksPerWeek} walks per week
            </p>
            <button
              className="btn btn-primary mt-4 w-full"
              onClick={() => handleSubscribe(subscription.id)}
              disabled={loadingSubscription === subscription.id}
            >
              {loadingSubscription === subscription.id
                ? "Redirecting..."
                : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}