"use client";

import React, { useEffect, useRef, useState } from "react";

const layers = [
  "Business",
  "Formation",
  "Financial Infrastructure",
  "Payments",
  "Digital Growth",
];

export function HeroVisual() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const cx = 150;
  const cy = 150;
  const r = 105;

  const startAngleDeg = -40; // Top right
  const endAngleDeg = -320; // Bottom right (counter-clockwise sweep)

  const startX = cx + r * Math.cos((startAngleDeg * Math.PI) / 180);
  const startY = cy + r * Math.sin((startAngleDeg * Math.PI) / 180);
  const endX = cx + r * Math.cos((endAngleDeg * Math.PI) / 180);
  const endY = cy + r * Math.sin((endAngleDeg * Math.PI) / 180);

  const pathData = `M ${startX} ${startY} A ${r} ${r} 0 1 0 ${endX} ${endY}`;

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-10 w-full max-w-3xl mx-auto"
      aria-label="Concentric diagram showing 5 stages of business growth: Business, Formation, Financial Infrastructure, Payments, and Digital Growth."
    >
      {/* SVG Diagram */}
      <div className="relative w-full flex-1 max-w-[240px] sm:max-w-[320px] aspect-square shrink-0">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Main bold C arc */}
          <path
            d={pathData}
            fill="none"
            className="stroke-foreground"
            strokeWidth="32"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength="1"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: hasAnimated ? 0 : 1,
              transition: "stroke-dashoffset 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)", // ease-out
            }}
          />

          {/* Core orange circle */}
          <circle
            cx={cx}
            cy={cy}
            r="28"
            className="fill-primary"
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: hasAnimated ? "scale(1)" : "scale(0)",
              transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s", // Pop in near the end of arc animation
            }}
          />
        </svg>
      </div>

      {/* Labels aligned column */}
      <ol className="flex flex-col gap-3 sm:gap-5 flex-1 list-none p-0 m-0 min-w-[140px]">
        {layers.map((label, i) => (
          <li
            key={label}
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 leading-tight"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transform: hasAnimated ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.4s ease-out ${1.1 + i * 0.08}s, transform 0.4s ease-out ${1.1 + i * 0.08}s`,
            }}
          >
            <span className="text-xs sm:text-sm text-primary-text font-bold">
              0{i + 1}
            </span>
            <span className="font-display font-semibold text-foreground text-sm sm:text-lg md:text-xl break-words whitespace-normal">
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
