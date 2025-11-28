"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useAuth } from "@/context/AuthContext";

interface Slot {
  iso: string;
  label: string;
  isPast: boolean;
}

interface Booking {
  id: string;
  startTime: string;
  status: string;
}

function getDaysOfWeek(): Array<{ date: Date; label: string; isToday: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: Array<{ date: Date; label: string; isToday: boolean }> = [];
  
  // Get start of this week (Sunday)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Generate 14 days (this week + next week)
  for (let i = 0; i < 14; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    const isToday = date.toDateString() === today.toDateString();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    days.push({
      date,
      label: `${dayName}, ${monthName} ${monthDay}${isToday ? ' (Today)' : ''}`,
      isToday,
    });
  }
  
  return days;
}

function generateSlots(dateString: string): Slot[] {
  const [year, month, day] = dateString.split("-").map(Number);
  const slots: Slot[] = [];
  const base = new Date(year, month - 1, day, 12, 0, 0, 0);
  const now = Date.now();

  for (let i = 0; i < 24; i += 1) {
    const slotDate = new Date(base.getTime() + i * 30 * 60 * 1000);
    const label = slotDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    slots.push({
      iso: slotDate.toISOString(),
      label,
      isPast: slotDate.getTime() < now,
    });
  }

  return slots;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export function BookingCalendar() {
  const { user, getIdToken, refreshProfile } = useAuth();
  const days = useMemo(() => getDaysOfWeek(), []);
  const todayIndex = days.findIndex(d => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => 
    todayIndex >= 0 ? todayIndex : 0
  );
  const selectedDate = days[selectedDayIndex]?.date;
  const dateString = selectedDate ? formatDateKey(selectedDate) : "";
  
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const slots = useMemo(
    () => (dateString ? generateSlots(dateString) : []),
    [dateString]
  );

  const fetchCurrentBooking = useCallback(async () => {
    if (!user) return;
    setLoadingBooking(true);
    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/bookings?scope=user", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentBooking(data.booking || null);
      }
    } catch (error) {
      console.error("Failed to load booking", error);
    } finally {
      setLoadingBooking(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    void fetchCurrentBooking();
  }, [fetchCurrentBooking]);

  const fetchSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true);
      try {
        const response = await fetch(`/api/bookings?date=${date}`);
        const data = await response.json();
        setBookedSlots(
          Array.isArray(data.bookedSlots)
            ? data.bookedSlots.filter(Boolean)
            : []
        );
      } catch (error) {
        console.error("Failed to load slots", error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  useEffect(() => {
    if (dateString && !currentBooking) {
      void fetchSlots(dateString);
    }
  }, [fetchSlots, dateString, currentBooking]);

  const handleDayClick = (index: number) => {
    setSelectedDayIndex(index);
    setSelectedSlot(null);
    setStatusMessage(null);
  };

  const handleSlotClick = (slot: Slot) => {
    if (bookedSlots.includes(slot.iso) || slot.isPast) return;
    setSelectedSlot(slot.iso);
    setStatusMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) {
      setStatusMessage({
        type: "error",
        message: "Please choose a time slot.",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      setStatusMessage(null);
      const idToken = await getIdToken();
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          startTime: selectedSlot,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to book slot.");
      }
      await refreshProfile();
      await fetchCurrentBooking();
      setStatusMessage({
        type: "success",
        message: "Walk booked successfully!",
      });
      setSelectedSlot(null);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to book slot.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!currentBooking) return;
    
    try {
      setCancelling(true);
      setStatusMessage(null);
      const idToken = await getIdToken();
      const response = await fetch(`/api/bookings?id=${currentBooking.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to cancel booking.");
      }
      await refreshProfile();
      await fetchCurrentBooking();
      setStatusMessage({
        type: "success",
        message: "Booking cancelled. You can now book a new time.",
      });
      setSelectedSlot(null);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to cancel booking.",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loadingBooking) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  // Show confirmation view if user has a booking
  if (currentBooking) {
    const bookingDate = new Date(currentBooking.startTime);
    const dateLabel = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeLabel = bookingDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Your Walk is Confirmed</h2>
          <p className="text-sm text-base-content/70">
            {user?.isVetted
              ? "Your walk is scheduled."
              : "Your free walk is scheduled - no payment required!"}
          </p>
        </div>

        <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Scheduled Walk</h3>
                <p className="text-base-content/70">
                  {dateLabel} at {timeLabel}
                </p>
              </div>
              <div className="badge badge-success badge-lg">Confirmed</div>
            </div>

            {statusMessage && (
              <div
                className={`alert ${
                  statusMessage.type === "success"
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                <span>{statusMessage.message}</span>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Change Time"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show booking picker if no booking
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Book a walk</h2>
        <p className="text-sm text-base-content/70">
          Pick a day and time for your walk.
        </p>
      </div>

      <div className="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-3">Select a day</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isSelected = selectedDayIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDayClick(index)}
                className={`btn btn-sm ${
                  isSelected
                    ? "btn-primary"
                    : day.isToday
                    ? "btn-outline btn-primary"
                    : "btn-outline"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {dateString && (
        <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-3">Select a time</h3>
          {loadingSlots ? (
            <div className="grid gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="skeleton h-12" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {slots.map((slot) => {
                const isBooked = bookedSlots.includes(slot.iso);
                const isSelected = selectedSlot === slot.iso;
                const disabled = isBooked || slot.isPast || submitting;

                return (
                  <button
                    key={slot.iso}
                    type="button"
                    className={`btn ${
                      isBooked
                        ? "btn-disabled"
                        : isSelected
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={disabled}
                  >
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <form
        className="space-y-4 rounded-box border border-base-200 bg-base-100 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h3 className="text-xl font-semibold">Confirm booking</h3>
          <p className="text-sm text-base-content/70">
            {user?.isVetted
              ? "Your walk will be scheduled."
              : "This is your free walk - no payment required!"}
          </p>
        </div>

        {statusMessage ? (
          <div
            className={`alert ${
              statusMessage.type === "success"
                ? "alert-success"
                : "alert-error"
            }`}
          >
            <span>{statusMessage.message}</span>
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !selectedSlot}
        >
          {submitting ? "Booking..." : "Book walk"}
        </button>
      </form>
    </div>
  );
}