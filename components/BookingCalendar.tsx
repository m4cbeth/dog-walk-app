"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAuth } from "@/context/AuthContext";

interface Slot {
  iso: string;
  label: string;
  isPast: boolean;
}

function startOfTodayISO(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0]!;
}

function generateSlots(dateString: string): Slot[] {
  const [year, month, day] = dateString.split("-").map(Number);
  const slots: Slot[] = [];
  const base = new Date(year, month - 1, day, 12, 0, 0, 0);
  const now = Date.now();

  for (let i = 0; i < 48; i += 1) {
    const slotDate = new Date(base.getTime() + i * 15 * 60 * 1000);
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

export function BookingCalendar() {
  const { user, getIdToken, refreshProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => startOfTodayISO());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDogOption, setSelectedDogOption] = useState("");
  const [customDogName, setCustomDogName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.dogs?.length) {
      setSelectedDogOption(user.dogs[0].name);
      setCustomDogName("");
    } else {
      setSelectedDogOption("");
      setCustomDogName("");
    }
  }, [user?.dogs]);

  const slots = useMemo(
    () => generateSlots(selectedDate),
    [selectedDate]
  );

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
    void fetchSlots(selectedDate);
  }, [fetchSlots, selectedDate]);

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedDate(value);
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
    const finalDogName = user?.dogs?.length
      ? selectedDogOption === "other"
        ? customDogName.trim()
        : selectedDogOption
      : customDogName.trim();

    if (!finalDogName) {
      setStatusMessage({
        type: "error",
        message: "Please tell us which dog this walk is for.",
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
          dogName: finalDogName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to book slot.");
      }
      setStatusMessage({
        type: "success",
        message: "Walk booked! We'll send a confirmation soon.",
      });
      setSelectedSlot(null);
      await refreshProfile();
      await fetchSlots(selectedDate);
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

  const minDate = startOfTodayISO();
  const tokens = user?.walkTokens ?? 0;
  const hasSavedDogs = Boolean(user?.dogs?.length);
  const finalDogName = hasSavedDogs
    ? selectedDogOption === "other"
      ? customDogName.trim()
      : selectedDogOption
    : customDogName.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Book a walk</h2>
          <p className="text-sm text-base-content/70">
            Pick a 15-minute slot between noon and midnight.
          </p>
        </div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Choose a date</span>
          </div>
          <input
            type="date"
            className="input input-bordered"
            min={minDate}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </label>
      </div>

      <div className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
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
              const disabled =
                isBooked || slot.isPast || tokens < 1 || submitting;

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

      <form
        className="space-y-4 rounded-box border border-base-200 bg-base-100 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h3 className="text-xl font-semibold">Confirm details</h3>
          <p className="text-sm text-base-content/70">
            Each booking uses one walk token.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Dog name</span>
            </div>
            {hasSavedDogs ? (
              <select
                className="select select-bordered"
                value={selectedDogOption}
                onChange={(event) => setSelectedDogOption(event.target.value)}
              >
                {user.dogs.map((dog) => (
                  <option key={dog.name} value={dog.name}>
                    {dog.name} · {dog.breed}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            ) : (
              <input
                className="input input-bordered"
                value={customDogName}
                onChange={(event) => setCustomDogName(event.target.value)}
                placeholder="Buddy"
              />
            )}
          </label>

          {hasSavedDogs && selectedDogOption === "other" ? (
            <label className="form-control">
              <div className="label">
                <span className="label-text">Custom dog name</span>
              </div>
              <input
                className="input input-bordered"
                value={customDogName}
                onChange={(event) => setCustomDogName(event.target.value)}
                placeholder="Enter name if not listed"
              />
            </label>
          ) : null}
        </div>

        {tokens < 1 ? (
          <div className="alert alert-warning">
            <span>You need at least one token to book a walk.</span>
          </div>
        ) : null}

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
          disabled={
            submitting || !selectedSlot || tokens < 1 || !finalDogName
          }
        >
          {submitting ? "Booking..." : "Book walk"}
        </button>
      </form>
    </div>
  );
}

