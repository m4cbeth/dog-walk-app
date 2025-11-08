import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyFirebaseIdToken } from "@/lib/firebase-admin";
import type { AppUser } from "@/types/user";

interface CreateBookingRequest {
  startTime: string;
  dogName: string;
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
    const dogName = body.dogName?.trim();
    if (!dogName) {
      return NextResponse.json(
        { error: "Please provide a dog name" },
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
    if (minutes % 15 !== 0) {
      return NextResponse.json(
        { error: "Start time must be on a 15-minute interval" },
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
      const currentTokens = userData.walkTokens ?? 0;
      if (currentTokens < 1) {
        throw new Error("Insufficient tokens");
      }

      const bookingSnap = await transaction.get(bookingRef);
      if (bookingSnap.exists) {
        throw new Error("Slot already booked");
      }

      transaction.set(bookingRef, {
        userId: decoded.uid,
        userName: userData.name,
        userEmail: userData.email,
        dogName,
        status: "booked",
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(new Date(start.getTime() + 15 * 60 * 1000)),
        dateKey: formatDateKey(start),
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.update(userRef, {
        walkTokens: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking creation failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to create booking";
    const status =
      message === "Insufficient tokens"
        ? 400
        : message === "Slot already booked"
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
          dogName: data.dogName,
          startTime: data.startTime?.toDate().toISOString(),
          status: data.status,
        };
      });

      return NextResponse.json({ bookings });
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

