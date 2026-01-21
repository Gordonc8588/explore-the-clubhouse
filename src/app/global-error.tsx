"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#FEFDF8",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          {/* Decorative icon */}
          <div
            style={{
              width: "6rem",
              height: "6rem",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "3rem",
            }}
          >
            🍂
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "#3D2914",
              margin: "0 0 1rem 0",
            }}
          >
            Something Went Wrong
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6B5C4C",
              maxWidth: "28rem",
              margin: "0 auto 2rem",
              lineHeight: 1.6,
            }}
          >
            We encountered a critical error. Our team has been notified. Please
            try refreshing the page.
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                backgroundColor: "#2D5A3D",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "transparent",
                color: "#2D5A3D",
                border: "2px solid #2D5A3D",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
