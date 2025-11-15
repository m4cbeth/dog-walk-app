"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import type { DogProfile } from "@/types/user";
import { WalkPackPurchase } from "@/components/WalkPackPurchase";

export default function CustomerProfile() {
  const { user, loading, updateProfileData } = useAuth();
  const [formName, setFormName] = useState("");
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormName(user.name);
      setDogs(user.dogs.length > 0 ? user.dogs : [{ name: "", breed: "", age: 0 }]);
    }
  }, [user]);

  const handleDogChange = (
    index: number,
    field: keyof DogProfile,
    value: string
  ) => {
    setDogs((prev) =>
      prev.map((dog, dogIndex) =>
        dogIndex === index
          ? { ...dog, [field]: field === "age" ? Number(value) : value }
          : dog
      )
    );
  };

  const addDog = () => {
    setDogs((prev) => [...prev, { name: "", breed: "", age: 0 }]);
  };

  const removeDog = (index: number) => {
    setDogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      const filteredDogs = dogs
        .filter((dog) => dog.name.trim() !== "")
        .map((dog) => ({
          ...dog,
          age: Number.isFinite(dog.age) ? dog.age : 0,
        }));
      await updateProfileData({
        name: formName,
        dogs: filteredDogs,
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
            Keep your contact and dog details up to date.
          </p>
        </div>
        <div className="badge badge-outline">
          Vetting: {user.vettingStatus}
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

          <div className="divider" />

          <div>
            <h2 className="text-xl font-semibold">Dogs</h2>
            <p className="text-sm text-base-content/70">
              Tell us about each dog we&apos;ll be walking.
            </p>
          </div>

          <div className="space-y-4">
            {dogs.map((dog, index) => (
              <div
                key={index}
                className="rounded-box border border-base-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Dog #{index + 1}</h3>
                  {dogs.length > 1 ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => removeDog(index)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 pt-3 md:grid-cols-2">
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Name</span>
                    </div>
                    <input
                      className="input input-bordered"
                      value={dog.name}
                      onChange={(event) =>
                        handleDogChange(index, "name", event.target.value)
                      }
                      placeholder="Buddy"
                    />
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Breed</span>
                    </div>
                    <input
                      className="input input-bordered"
                      value={dog.breed}
                      onChange={(event) =>
                        handleDogChange(index, "breed", event.target.value)
                      }
                      placeholder="Golden Retriever"
                    />
                  </label>
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text">Age</span>
                    </div>
                    <input
                      className="input input-bordered"
                      type="number"
                      min={0}
                      value={dog.age ?? 0}
                      onChange={(event) =>
                        handleDogChange(index, "age", event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={addDog}
          >
            Add another dog
          </button>

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

        <aside className="space-y-4 rounded-box border border-base-200 bg-base-100 p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">Walk Tokens</h2>
            <p className="text-sm text-base-content/70">
              Purchase walk packs to keep your balance topped up.
            </p>
          </div>
          <div className="stat">
            <div className="stat-title">Current balance</div>
            <div className="stat-value text-primary">
              {user.walkTokens ?? 0}
            </div>
            <div className="stat-desc">Tokens remaining</div>
          </div>
          <WalkPackPurchase />
        </aside>
      </div>
    </div>
  );
}

