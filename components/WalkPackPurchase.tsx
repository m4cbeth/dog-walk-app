"use client";

import { useState } from "react";
import { WALK_PACKS } from "@/lib/walkPacks";
import { useAuth } from "@/context/AuthContext";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function WalkPackPurchase() {
  const { getIdToken, user } = useAuth();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoadingPack(packId);
    setError(null);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ packId }),
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
      setLoadingPack(null);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-info">
        <span>Sign in to purchase walk packs.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {WALK_PACKS.map((pack) => (
          <div
            key={pack.id}
            className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{pack.name}</h3>
            <p className="text-sm text-base-content/70">
              {pack.tokens} walk tokens · {currency.format(pack.priceCents / 100)}
            </p>
            <button
              className="btn btn-primary mt-4 w-full"
              onClick={() => handlePurchase(pack.id)}
              disabled={loadingPack === pack.id}
            >
              {loadingPack === pack.id ? "Redirecting..." : "Buy now"}
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

