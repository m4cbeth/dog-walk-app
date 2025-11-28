"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { LuDog } from "react-icons/lu";
import { RiToothLine } from "react-icons/ri";

function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const adminEmails = getAdminEmails();
  const isAdmin =
    user?.email && adminEmails.includes(user.email.toLowerCase());

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await logout();
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-base-200/50 bg-base-100/40 backdrop-blur flex justify-between">
      <div className="px-4 py-4">
        <div className="text-3xl tracking-wide font-black flex gap-2 align-baseline">
          <LuDog />
          <Link href="/" className="">
            Mahogany Walks
          </Link>
          <RiToothLine />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <nav className="hidden items-center gap-4 text-lg font-medium md:flex">
          <Link href="/">Home</Link>
          {user ? (
            <>
              {!isAdmin ? <Link href="/dashboard">Dashboard</Link> : null}
              {isAdmin ? (
                <>
                  <Link href="/admin/users">Users</Link>
                  <Link href="/admin/bookings">Bookings</Link>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/#features">Features</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/login">Log in</Link>
            </>
          )}
        </nav>
        {user ? (
          <button
          className="btn btn-lg btn-ghost  "
          onClick={handleSignOut}
          disabled={isSigningOut}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        ) : (
          <Link href="/signup" className="btn btn-lg btn-primary">
            Book Your Free Walk!
          </Link>
        )} 
        <ThemeToggle />
      </div>
    </header>
  );
}

