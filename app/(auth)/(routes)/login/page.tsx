"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-box border border-base-200 bg-base-100 p-8 shadow-sm">
      <h1 className="mb-2 text-3xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-base-content/70">
        Sign in to manage your profile and book walks.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <input
            className="input input-bordered"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="form-control">
          <div className="label">
            <span className="label-text">Password</span>
          </div>
          <input
            className="input input-bordered"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        {error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? "Signing in..." : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-base-content/70">
        Need an account?{" "}
        <Link href="/signup" className="link link-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}

