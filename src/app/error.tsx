"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-4">
      <div className="text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-coral/20">
          <span className="text-5xl">🍂</span>
        </div>

        {/* Title */}
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
          Something Went Wrong
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md font-body text-lg text-stone">
          We encountered an unexpected error. Don&apos;t worry, these things
          happen sometimes. Let&apos;s try again.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mx-auto mt-6 max-w-lg rounded-lg bg-red-50 p-4 text-left">
            <p className="font-mono text-sm text-red-800">{error.message}</p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-red-600">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="inline-block rounded-lg bg-forest px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-meadow focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-block rounded-lg border-2 border-forest px-6 py-3 font-display font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            Go Home
          </a>
        </div>

        {/* Contact info */}
        <p className="mt-8 font-body text-sm text-pebble">
          If this keeps happening, please contact us at{" "}
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
