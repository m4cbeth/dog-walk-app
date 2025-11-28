import Link from "next/link";
import { RiToothLine } from "react-icons/ri";

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid gap-10 rounded-box bg-linear-to-br from-accent-content/20 via-primary/40 to-secondary/30 px-6 py-16 md:grid-cols-2 md:items-center md:px-12">
        <div className="space-y-6">
          <span className="text-white text-xl p-4 badge badge-primary badge-outline">
            Trusted neighborhood walkers
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Potty break, playtime, and a fresh teeth
            <span className="relative ">
              <RiToothLine
                className="absolute left-10 top-3"
                aria-hidden="true"
                focusable="false"
              />
            </span>.
            <br /> Every walk,
            <br /> every time.
          </h1>
          <p className="text-lg text-base-content/70">
            Your dog’s daily happiness, handled. Pick your plan, choose your days, and relax. We’ve get the rest.
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
            Slots open every 20 minutes from noon to midnight. Grab yours before
            they&apos;re gone!
          </p>
        </div>
      </section>

      <section id="features" className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-5xl font-black">
            Daily walks + fresh breath training
          </h2>
          <p className="text-3xl text-base-content/70">
            Anyone can take a walk around the block. We care about your pup's teeth!
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "20-minute neighborhood walks",
              description:
                "Potty breaks, sniff time, and enough movement to tire them out without wearing them down.",
            },
            {
              title: "Play or socialize (their choice)",
              description:
                "Some pups love other dogs. Some want solo fetch. We match their energy, not ours.",
            },
            {
              title: "Fresh Breath Club™",
              description:
                "We train daily teeth brushing: the #1 one thing vets beg you to do but nobody actually does.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-box border border-base-200 bg-primary-content text-secondary p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-white">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-7xl font-black">
            How it works
          </h2>
          <p className="text-3xl text-base-content/70">
            Three steps to a happier, fresher-breath pup.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Book your first free walk",
              description:
                "Meet us, see if we vibe, zero commitment.",
            },
            {
              step: "2",
              title: "Pick Your Plan",
              description:
                "2, 3 or 5 walk routines, you get to pick!",
            },
            {
              step: "3",
              title: "We Handle the Rest",
              description:
                "Potty breaks, play time, and fresh breath training.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-box border border-base-200 bg-secondary p-6 shadow-sm"
            >
              <span className="badge badge-lg text-white bg-secondary-content">{item.step}</span>
              <h3 className="mt-4 text-xl text-secondary-content font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-black">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-7xl font-black">
            Simple pricing
          </h2>
          <p className="text-base-content/70 text-2xl mt-5">
            Choose how many walks work for you and your pup!
          </p>
        </div>

        <div className="space-y-8">
          {/* <div>
            <h3 className="mb-4 text-center text-5xl font-black">
              Walk Packs
            </h3>
            <p className="mb-6 text-center text-2xl mt-5 text-base-content/70">
              Buy walks in packs and use them whenever you need them, no expiration dates.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {WALK_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-box border border-base-200 bg-primary-content text-primary p-8 text-center shadow-md"
                >
                  <h4 className="text-2xl font-semibold">{pack.name}</h4>
                  <p className="mt-2 text-sm text-white/70">
                    {pack.tokens} {pack.tokens > 1 ? "walks" : "walk"} •{" "}
                    {(pack.priceCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                  <Link href="/signup" className="btn btn-primary btn-sm mt-6">
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          </div> */}

          <div>
            {/* <h3 className="mb-4 text-center text-5xl font-black">
              Monthly Subscriptions
            </h3>
            <p className="mb-6 text-center text-3xl text-base-content/70">
              Set up a regular routine with weekly walks on a monthly basis.
            </p> */}
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "2 Walks/Week",
                  price: "$249 per month",
                  body: "Two visits a week for busy families. Each visit includes a walk, potty break, playtime, and gentle teeth-brushing training. Perfect for maintaining healthy routines.",
                },
                {
                  title: "3 Walks/Week",
                  price: "$299 per month",
                  body: "",
                },
                {
                  title: "360° Coverage (5/wk)",
                  price: "$449 per month",
                  body: "",
                },
              ].map((subscription, idx) => (
                <div
                  style={idx === 2 ? { boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0,0,0,.5)' } : {}}
                  key={subscription.title}
                  className="rounded-box border border-base-200 text-primary bg-primary-content p-8 text-center shadow-md"
                >
                  <h4
                    style={idx === 2 ? { textShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)' } : {}}
                    className={`text-2xl font-semibold ${idx === 2 ? "bg-linear-to-br from-indigo-300 via-cyan-300 to-violet-300  bg-clip-text text-transparent" : ""}`}>{subscription.title}</h4>
                  <p className="mt-2 text-sm text-white/70">
                    {subscription.price}
                  </p>
                  <Link href="/signup" className={`btn btn-primary btn-sm mt-6 ${idx === 2 ? " bg-linear-to-r from-cyan-300 to-indigo-500" : ""}`}>
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-2xl text-base-content/90">
          Cancel anytime for a full refund on unused visits.
        </p>

        <p className="text-center text-lg text-base-content/70">
          Have multiple dogs or need a custom plan? Book your first walk and we'll discuss rates.
        </p>
      </section>
      <section className="rounded-box bg-base-200 px-6 py-16 text-center md:px-12">
        <h2 className="text-3xl font-semibold">
          Ready for happier walks and cleaner teeth?
        </h2>
        <p className="mt-3 text-base text-base-content/70">
          Set up your account in minutes, add your dog&apos;s details, and book your first free walk.
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

