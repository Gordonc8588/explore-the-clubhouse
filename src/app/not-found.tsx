import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-4">
      <div className="text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sage/20">
          <span className="text-5xl">🌿</span>
        </div>

        {/* Error code */}
        <p className="font-display text-lg font-semibold uppercase tracking-wide text-meadow">
          404 Error
        </p>

        {/* Title */}
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md font-body text-lg text-stone">
          Oops! Looks like you&apos;ve wandered off the trail. The page you&apos;re
          looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-block rounded-lg bg-forest px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-meadow focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            href="/clubs"
            className="inline-block rounded-lg border-2 border-forest px-6 py-3 font-display font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            View Clubs
          </Link>
        </div>

        {/* Contact info */}
        <p className="mt-8 font-body text-sm text-pebble">
          Need help? Contact us at{" "}
          <a
            href="mailto:hello@exploretheclubhouse.co.uk"
            className="text-forest underline hover:text-meadow"
          >
            hello@exploretheclubhouse.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}
