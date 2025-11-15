"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser, DogProfile, VettingStatus } from "@/types/user";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signup: (
    params: SignupParams
  ) => Promise<{ firebaseUid: string; profile: AppUser }>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (
    update: Partial<Omit<AppUser, "uid" | "email">>
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

interface SignupParams {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function determineRole(email: string): "customer" | "admin" {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase()) ? "admin" : "customer";
}

async function readUserProfile(uid: string): Promise<AppUser | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data();
  const email = data.email ?? "";
  return {
    uid,
    name: data.name ?? "",
    email,
    role: (data.role ?? determineRole(email)) as "customer" | "admin",
    vettingStatus: (data.vettingStatus ?? "pending") as VettingStatus,
    walkTokens: data.walkTokens ?? 0,
    dogs: (data.dogs ?? []) as DogProfile[],
  };
}

async function createProfileDocument(
  uid: string,
  profile: Omit<AppUser, "uid">
) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

async function updateProfileDocument(
  uid: string,
  update: Partial<Omit<AppUser, "uid">>
) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...update,
    updatedAt: serverTimestamp(),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await readUserProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
        } else {
          const email = firebaseUser.email ?? "";
          const fallback: AppUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName ?? "",
            email,
            role: determineRole(email),
            vettingStatus: "pending",
            walkTokens: 0,
            dogs: [],
          };
          setUser(fallback);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const ensureProfileDocument = useCallback(
    async (firebaseUid: string, fallback: AppUser) => {
      const existing = await readUserProfile(firebaseUid);
      if (existing) {
        setUser(existing);
        return existing;
      }
      const profileData = {
        name: fallback.name,
        email: fallback.email,
        role: fallback.role,
        vettingStatus: fallback.vettingStatus,
        walkTokens: fallback.walkTokens,
        dogs: fallback.dogs,
      };
      await createProfileDocument(firebaseUid, profileData);
      setUser(fallback);
      return fallback;
    },
    []
  );

  const signup = useCallback(
    async ({ name, email, password }: SignupParams) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credential.user, { displayName: name });

      const role = determineRole(email);
      const profile: AppUser = {
        uid: credential.user.uid,
        name,
        email,
        role,
        vettingStatus: "pending",
        walkTokens: 0,
        dogs: [],
      };
      const profileData = {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        vettingStatus: profile.vettingStatus,
        walkTokens: profile.walkTokens,
        dogs: profile.dogs,
      };
      await createProfileDocument(credential.user.uid, profileData);
      setUser(profile);
      return { firebaseUid: credential.user.uid, profile };
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const existing = await readUserProfile(credential.user.uid);
      if (existing) {
        setUser(existing);
        return;
      }
      const userEmail = credential.user.email ?? email;
      const fallback: AppUser = {
        uid: credential.user.uid,
        name: credential.user.displayName ?? "",
        email: userEmail,
        role: determineRole(userEmail),
        vettingStatus: "pending",
        walkTokens: 0,
        dogs: [],
      };
      await ensureProfileDocument(credential.user.uid, fallback);
    },
    [ensureProfileDocument]
  );

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = credential.user;
    const email = firebaseUser.email ?? "";
    const fallback: AppUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName ?? "",
      email,
      role: determineRole(email),
      vettingStatus: "pending",
      walkTokens: 0,
      dogs: [],
    };
    await ensureProfileDocument(firebaseUser.uid, fallback);
  }, [ensureProfileDocument]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return;
    const updated = await readUserProfile(user.uid);
    if (updated) {
      setUser(updated);
    }
  }, [user?.uid]);

  const updateProfileData = useCallback(
    async (update: Partial<Omit<AppUser, "uid" | "email">>) => {
      if (!user) throw new Error("No authenticated user");
      await updateProfileDocument(user.uid, update);
      await refreshProfile();
    },
    [refreshProfile, user]
  );

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }
    return auth.currentUser.getIdToken();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      loginWithGoogle,
      logout,
      updateProfileData,
      refreshProfile,
      getIdToken,
    }),
    [
      user,
      loading,
      signup,
      login,
      loginWithGoogle,
      logout,
      updateProfileData,
      refreshProfile,
      getIdToken,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

