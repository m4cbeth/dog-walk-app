"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { WalkPackPurchase } from "@/components/WalkPackPurchase";
import { BookingCalendar } from "@/components/BookingCalendar";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-6 w-full" />
        <div className="skeleton h-6 w-full" />
        <div className="skeleton h-6 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <span>Please log in to access your dashboard.</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Welcome, {user.name || "walker"}</h1>
          <p className="text-base-content/70">
            Track your walk tokens, manage your dogs, and book your next walk.
          </p>
        </div>
        <div className="badge badge-outline">Vetting: {user.vettingStatus}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Walk Tokens</h2>
          <p className="text-sm text-base-content/70">
            Use tokens to book 15-minute walk slots.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              {user.walkTokens ?? 0}
            </span>
            <span className="text-sm text-base-content/70">tokens</span>
          </div>
          <div className="mt-6">
            <WalkPackPurchase />
          </div>
        </div>

        <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Your Dogs</h2>
          {user.dogs.length === 0 ? (
            <p className="text-sm text-base-content/70">
              Add your dogs to make booking faster.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {user.dogs.map((dog, index) => (
                <li
                  key={`${dog.name}-${index}`}
                  className="rounded-lg bg-base-200 px-4 py-2"
                >
                  <div className="font-medium">{dog.name}</div>
                  <div className="text-sm text-base-content/70">
                    {dog.breed} · {dog.age} yrs
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/profile" className="btn btn-outline mt-6 w-full">
            Update profile
          </Link>
        </div>
      </div>
      <BookingCalendar />
    </div>
  );
}

