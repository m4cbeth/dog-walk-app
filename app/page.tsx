import Link from "next/link";
import { WALK_PACKS } from "@/lib/walkPacks";

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid gap-10 rounded-box bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 px-6 py-16 md:grid-cols-2 md:items-center md:px-12">
        <div className="space-y-6">
          <span className="badge badge-primary badge-outline">
            Trusted neighborhood walkers
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Potty break, playtime, and a fresh brush—every walk, every time.
          </h1>
          <p className="text-lg text-base-content/70">
            Keep your pup happy while you tackle your day. Book 15-minute walk
            slots with vetted walkers, manage your dog’s profile, and track
            tokens from one simple dashboard.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Book your first walk
            </Link>
            <Link href="/#pricing" className="btn btn-outline">
              View walk packs
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Today&apos;s schedule snapshot</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
              <span>12:15 PM · Luna</span>
              <span className="badge badge-primary badge-sm">Booked</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-3">
              <span>1:00 PM · Open slot</span>
              <span className="badge badge-outline badge-sm">Available</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-3">
              <span>3:30 PM · Max</span>
              <span className="badge badge-primary badge-sm">Booked</span>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-3">
              <span>6:45 PM · Open slot</span>
              <span className="badge badge-outline badge-sm">Available</span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-base-content/70">
            Slots open every 15 minutes from noon to midnight. Grab yours before
            they&apos;re gone!
          </p>
        </div>
      </section>

      <section id="features" className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">More than just a walk</h2>
          <p className="text-base text-base-content/70">
            Every visit covers the essentials so you can relax.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Potty break",
              description:
                "Quick relief and a hydration check to keep tails wagging.",
            },
            {
              title: "Play session",
              description:
                "We squeeze in fetch or tug to burn energy and brighten moods.",
            },
            {
              title: "Brush & update",
              description:
                "Light grooming plus notes so you know exactly how it went.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-base-content/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <p className="text-base text-base-content/70">
            A seamless flow from signup to confirmation.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Create your profile",
              description:
                "Share your dog’s info, routines, and any special notes.",
            },
            {
              step: "2",
              title: "Buy walk tokens",
              description:
                "Choose a walk pack that fits your schedule and budget.",
            },
            {
              step: "3",
              title: "Book in minutes",
              description:
                "Pick a 15-minute slot and get instant confirmation.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-box border border-base-200 bg-base-100 p-6 shadow-sm"
            >
              <span className="badge badge-lg badge-secondary">{item.step}</span>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-base-content/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold">Simple walk packs</h2>
          <p className="text-base text-base-content/70">
            Token-based pricing keeps every walk predictable.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {WALK_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-box border border-base-200 bg-base-100 p-8 text-center shadow-md"
            >
              <h3 className="text-2xl font-semibold">{pack.name}</h3>
              <p className="mt-2 text-sm text-base-content/70">
                {pack.tokens} walks •{" "}
                {(pack.priceCents / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
              <p className="mt-4 text-sm text-base-content/70">
                Use tokens whenever you need them—no expiration dates.
              </p>
              <Link href="/signup" className="btn btn-primary mt-6">
                Get started
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-base-content/70">
          Need a custom plan or have multiple pups? Reach out and we&apos;ll
          tailor a pack for you.
        </p>
      </section>

      <section className="rounded-box bg-base-200 px-6 py-16 text-center md:px-12">
        <h2 className="text-3xl font-semibold">
          Ready for happier walks and cleaner paws?
        </h2>
        <p className="mt-3 text-base text-base-content/70">
          Set up your account in minutes, add your dog&apos;s details, and lock
          in your favorite walk slots.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="btn btn-primary">
            Create account
          </Link>
          <Link href="/login" className="btn btn-outline">
            I already have an account
          </Link>
        </div>
      </section>
    </div>
  );
}
