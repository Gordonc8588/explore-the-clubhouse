import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  backgroundImage,
  overlay = true,
}: PageHeaderProps) {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 px-4 md:px-8 relative"
      style={{
        backgroundColor: backgroundImage ? "transparent" : "var(--craigies-olive)",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(122, 124, 74, 0.85)" }}
        />
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: "white",
          }}
          className="text-4xl md:text-5xl lg:text-6xl mb-4"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
