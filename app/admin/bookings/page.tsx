"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AdminBooking {
  id: string;
  userName: string;
  userEmail: string;
  startTime: string;
  status: string;
}

export default function AdminBookingsPage() {
  const { user, getIdToken } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await getIdToken();
        const response = await fetch("/api/bookings?scope=admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 403) {
          setError("You do not have permission to view this page.");
          return;
        }
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Unable to load bookings.");
        }
        const data = (await response.json()) as {
          bookings: AdminBooking[];
        };
        setBookings(data.bookings ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [getIdToken, user]);

  if (!user) {
    return (
      <div className="alert alert-warning">
        <span>Please sign in to view admin bookings.</span>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Upcoming Walks</h1>
        <p className="text-sm text-base-content/70">
          Review the schedule for the next confirmed walks.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="alert">
          <span>No upcoming walks scheduled.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100 shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const date = new Date(booking.startTime);
                return (
                  <tr key={booking.id}>
                    <td>{date.toLocaleDateString()}</td>
                    <td>{date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</td>
                    <td>{booking.userName}</td>
                    <td>{booking.userEmail}</td>
                    <td className="capitalize">{booking.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

