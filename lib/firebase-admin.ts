import { getApps, initializeApp, cert, type AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let firebaseAdminApp: ReturnType<typeof initializeApp> | null = null;

function getAdminApp() {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  const options: AppOptions = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  };

  firebaseAdminApp = getApps()[0] ?? initializeApp(options);
  return firebaseAdminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function verifyFirebaseIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken);
}

