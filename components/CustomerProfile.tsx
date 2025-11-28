"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { WalkPackPurchase } from "@/components/WalkPackPurchase";

export default function CustomerProfile() {
  const { user, loading, updateProfileData } = useAuth();
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormName(user.name);
    }
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateProfileData({
        name: formName,
      });
      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

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

  if (!user) {
    return (
      <div className="alert alert-warning">
        <span>Please sign in to manage your profile.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Profile</h1>
          <p className="text-base-content/70">
            Keep your contact information up to date.
          </p>
        </div>
        <div className="badge badge-outline">
          {user.isVetted ? "Vetted" : "Pending Vetting"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <form
          className="space-y-6 rounded-box border border-base-200 bg-base-100 p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-xl font-semibold">Owner Details</h2>
            <p className="text-sm text-base-content/70">
              We&apos;ll contact you using this information.
            </p>
          </div>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Name</span>
            </div>
            <input
              className="input input-bordered"
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              placeholder="Jane Doe"
              required
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Email</span>
            </div>
            <input
              className="input input-bordered"
              value={user.email}
              readOnly
              disabled
            />
          </label>

          {message ? (
            <div className="alert alert-info">
              <span>{message}</span>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>

        {user.isVetted && (
          <aside className="space-y-4 rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold">Subscription</h2>
              <p className="text-sm text-base-content/70">
                Choose a subscription plan to continue booking walks.
              </p>
            </div>
            <WalkPackPurchase />
          </aside>
        )}
      </div>
    </div>
  );
}