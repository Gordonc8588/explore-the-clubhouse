import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Clubhouse - Children's Holiday Club";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2D5A3D", // Forest Green
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px",
          }}
        >
          {/* Logo/Icon placeholder - tree emoji */}
          <div
            style={{
              fontSize: 80,
              marginBottom: 20,
            }}
          >
            🌳
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              margin: 0,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            The Clubhouse
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.9)",
              margin: 0,
              marginBottom: 32,
            }}
          >
            Children&apos;s Holiday Club
          </p>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 32px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 24, color: "rgba(255, 255, 255, 0.9)" }}>
              🐐 Farm Activities
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>•</span>
            <span style={{ fontSize: 24, color: "rgba(255, 255, 255, 0.9)" }}>
              🌲 Forest Exploration
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>•</span>
            <span style={{ fontSize: 24, color: "rgba(255, 255, 255, 0.9)" }}>
              🎨 Creative Fun
            </span>
          </div>

          {/* Location */}
          <p
            style={{
              fontSize: 20,
              color: "rgba(255, 255, 255, 0.7)",
              margin: 0,
              marginTop: 32,
            }}
          >
            Craigies Farm, South Queensferry
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
