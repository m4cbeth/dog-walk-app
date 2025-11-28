"use client";

import { useAuth } from "@/context/AuthContext";
import { BookingCalendar } from "@/components/BookingCalendar";
import { WalkPackPurchase } from "@/components/WalkPackPurchase";
import { FaCircleInfo } from "react-icons/fa6";
// import { FaCircleInfo } from "react-icons/fa6";

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
            {user.isVetted
              ? "Book your walks and manage your schedule."
              : "Book your free walk to get started!"}
          </p>
        </div>
        <div className="badge badge-outline">
          {user.isVetted ? "Vetted" : "Pending Vetting"}
        </div>
      </div>

      {!user.isVetted ? (
        <>
          <div className="alert alert-info">
            <FaCircleInfo />
            <span>Pick a time for your free walk and vibe check!</span>
          </div>
          <BookingCalendar />
        </>
      ) : (
        <>
          <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Choose a subscription plan to continue booking walks.
            </p>
            <WalkPackPurchase />
          </div>
          <BookingCalendar />
        </>
      )}
    </div>
  );
}