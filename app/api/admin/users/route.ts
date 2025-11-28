import { NextResponse } from "next/server";
import { getAdminDb, verifyFirebaseIdToken } from "@/lib/firebase-admin";

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

async function requireAdmin(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
    }
    const token = authHeader.slice("Bearer ".length);
    const decoded = await verifyFirebaseIdToken(token);
    const adminEmails = getAdminEmails();
    if (!decoded.email || !adminEmails.includes(decoded.email.toLowerCase())) {
        throw new Error("Forbidden");
    }
    return decoded;
}

export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const db = getAdminDb();
        const snapshot = await db.collection("users").get();

        const users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                uid: doc.id,
                name: data.name ?? "",
                email: data.email ?? "",
                isVetted: data.isVetted ?? false,
                walksPerWeek: data.walksPerWeek ?? 1,
                createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Failed to fetch users", error);
        const message = error instanceof Error ? error.message : "Unable to fetch users";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

export async function PATCH(request: Request) {
    try {
        await requireAdmin(request);
        const body = await request.json();
        const { uid, isVetted } = body;

        if (!uid || typeof isVetted !== "boolean") {
            return NextResponse.json(
                { error: "Missing uid or isVetted" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        await db.collection("users").doc(uid).update({
            isVetted,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update user", error);
        const message = error instanceof Error ? error.message : "Unable to update user";
        const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
