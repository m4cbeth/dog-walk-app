import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyFirebaseIdToken } from "@/lib/firebase-admin";
import type { AppUser } from "@/types/user";

interface CreateBookingRequest {
  startTime: string;
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice("Bearer ".length);
    const decoded = await verifyFirebaseIdToken(token);

    const body = (await request.json()) as CreateBookingRequest;
    if (!body.startTime) {
      return NextResponse.json(
        { error: "Missing start time" },
        { status: 400 }
      );
    }

    const start = new Date(body.startTime);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start time" },
        { status: 400 }
      );
    }

    const minutes = start.getUTCMinutes();
    if (minutes % 30 !== 0) {
      return NextResponse.json(
        { error: "Start time must be on a 30-minute interval" },
        { status: 400 }
      );
    }

    const slotId = start.toISOString();
    const db = getAdminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const bookingRef = db.collection("bookings").doc(slotId);

    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        throw new Error("User profile not found");
      }
      const userData = userSnap.data() as AppUser;
      
      // For unvetted users, only allow one booking (their free walk)
      if (!userData.isVetted) {
        if (userData.firstFreeWalkBookingId) {
          // Check if the existing booking still exists
          const existingBookingRef = db.collection("bookings").doc(userData.firstFreeWalkBookingId);
          const existingBookingSnap = await transaction.get(existingBookingRef);
          if (existingBookingSnap.exists && existingBookingSnap.data()?.status === "booked") {
            throw new Error("You already have a free walk booked. Please cancel it first to book a new time.");
          }
        }
      }

      const bookingSnap = await transaction.get(bookingRef);
      if (bookingSnap.exists) {
        throw new Error("Slot already booked");
      }

      transaction.set(bookingRef, {
        userId: decoded.uid,
        userName: userData.name,
        userEmail: userData.email,
        status: "booked",
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(new Date(start.getTime() + 30 * 60 * 1000)),
        dateKey: formatDateKey(start),
        createdAt: FieldValue.serverTimestamp(),
      });

      // For unvetted users, store the booking ID as their first free walk
      if (!userData.isVetted) {
        transaction.update(userRef, {
          firstFreeWalkBookingId: slotId,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking creation failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to create booking";
    const status =
      message === "Slot already booked"
        ? 409
        : message === "User profile not found"
        ? 404
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") ?? "public";
    const db = getAdminDb();

    if (scope === "admin") {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const token = authHeader.slice("Bearer ".length);
      const decoded = await verifyFirebaseIdToken(token);
      const adminEmails = getAdminEmails();
      if (!decoded.email || !adminEmails.includes(decoded.email.toLowerCase())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const now = new Date();
      const snapshot = await db
        .collection("bookings")
        .where("startTime", ">=", Timestamp.fromDate(now))
        .orderBy("startTime", "asc")
        .limit(100)
        .get();

      const bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userName: data.userName,
          userEmail: data.userEmail,
          startTime: data.startTime?.toDate().toISOString(),
          status: data.status,
        };
      });

      return NextResponse.json({ bookings });
    }

    if (scope === "user") {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const token = authHeader.slice("Bearer ".length);
      const decoded = await verifyFirebaseIdToken(token);

      // Get user's current booking
      const userRef = db.collection("users").doc(decoded.uid);
      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        return NextResponse.json({ booking: null });
      }

      const userData = userSnap.data() as AppUser;
      
      // For unvetted users, check their first free walk booking
      if (!userData.isVetted && userData.firstFreeWalkBookingId) {
        const bookingRef = db.collection("bookings").doc(userData.firstFreeWalkBookingId);
        const bookingSnap = await bookingRef.get();
        if (bookingSnap.exists) {
          const bookingData = bookingSnap.data();
          if (bookingData?.status === "booked") {
            return NextResponse.json({
              booking: {
                id: bookingSnap.id,
                startTime: bookingData.startTime?.toDate().toISOString(),
                status: bookingData.status,
              },
            });
          }
        }
      }

      // For vetted users or no booking found, check for any upcoming bookings
      const now = new Date();
      const snapshot = await db
        .collection("bookings")
        .where("userId", "==", decoded.uid)
        .where("startTime", ">=", Timestamp.fromDate(now))
        .where("status", "==", "booked")
        .orderBy("startTime", "asc")
        .limit(1)
        .get();

      if (snapshot.docs.length > 0) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return NextResponse.json({
          booking: {
            id: doc.id,
            startTime: data.startTime?.toDate().toISOString(),
            status: data.status,
          },
        });
      }

      return NextResponse.json({ booking: null });
    }

    const date = url.searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    const snapshot = await db
        .collection("bookings")
        .where("dateKey", "==", date)
        .get();

    const bookedSlots = snapshot.docs.map((doc) => {
      const data = doc.data();
      return data.startTime?.toDate().toISOString();
    });

    return NextResponse.json({ bookedSlots });
  } catch (error) {
    console.error("Fetch bookings failed", error);
    return NextResponse.json(
      { error: "Unable to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice("Bearer ".length);
    const decoded = await verifyFirebaseIdToken(token);

    const url = new URL(request.url);
    const bookingId = url.searchParams.get("id");
    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing booking ID" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const bookingRef = db.collection("bookings").doc(bookingId);

    await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists) {
        throw new Error("User profile not found");
      }

      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw new Error("Booking not found");
      }

      const bookingData = bookingSnap.data();
      if (bookingData?.userId !== decoded.uid) {
        throw new Error("Unauthorized to cancel this booking");
      }

      if (bookingData?.status !== "booked") {
        throw new Error("Booking is not active");
      }

      // Cancel the booking
      transaction.update(bookingRef, {
        status: "cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
      });

      // For unvetted users, clear their first free walk booking ID
      const userData = userSnap.data() as AppUser;
      if (!userData.isVetted && userData.firstFreeWalkBookingId === bookingId) {
        transaction.update(userRef, {
          firstFreeWalkBookingId: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to cancel booking";
    const status =
      message === "Booking not found" || message === "User profile not found"
        ? 404
        : message === "Unauthorized to cancel this booking"
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

