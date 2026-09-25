"use client";

import React, { useEffect, useRef, useState } from "react";

const layers = [
  "Business Formation",
  "Financial Infrastructure",
  "Payment Setup",
  "Digital Solutions",
  "Scalable Growth",
];

/**
 * HeroVisual — brand-mark draw-in animation.
 *
 * Sequence:
 *  1. "C" arc path strokes in over ~1.1 s (stroke-dashoffset draw-in).
 *  2. Orange chevron/arrow path scales + fades in over 400 ms starting 0.9 s in.
 *  3. Layer labels stagger in once the mark is fully visible.
 *
 * Accessibility: prefers-reduced-motion skips directly to the final state.
 * Single-trigger: IntersectionObserver disconnects after first intersection.
 */
export function HeroVisual() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion — jump straight to final state
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

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center gap-8 lg:gap-4 w-full max-w-lg mx-auto"
      aria-label="Brand mark animation alongside five pillars: Business Formation, Financial Infrastructure, Payment Setup, Digital Solutions, Scalable Growth."
    >
      {/* Brand mark SVG — paths sourced directly from public/brand/mark.svg viewBox 0 0 2048 1917 */}
      <div
        className="relative flex-shrink-0 w-[220px] h-[205px] lg:w-[180px] lg:h-[168px]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 2048 1917"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/*
           * ── "C" arc path ──────────────────────────────────────────────
           * Uses stroke-dasharray/strokeDashoffset draw-in with pathLength="1".
           * Fill is transparent while stroking; after the animation we also
           * reveal the fill so the shape looks solid.
           */}
          <path
            d="M 1004.64 299.434 C 1031.19 298.1 1067.13 299.73 1093.59 302.524 C 1221.53 315.971 1342.3 368.259 1439.65 452.362 C 1455.82 466.411 1478.38 486.921 1491.98 503.719 C 1476.7 514.668 1443.49 533.459 1425.88 544.26 C 1378.2 573.302 1330.7 602.622 1283.37 632.217 C 1219.84 571.907 1137.9 534.681 1050.69 526.511 C 945.971 518.113 842.219 551.743 762.34 619.974 C 673.415 695.659 618.646 803.914 610.35 920.393 C 602.264 1022.36 641.719 1126.2 707.674 1203.34 C 774.832 1282.22 870.48 1331.31 973.722 1339.9 C 1082.62 1348.21 1184.08 1310.09 1266.29 1239.61 C 1281.47 1247.54 1299.84 1259.05 1314.88 1267.89 C 1369.51 1299.91 1424.38 1331.51 1479.5 1362.68 C 1478.75 1363.58 1477.97 1364.46 1477.19 1365.33 C 1464.37 1379.57 1440.77 1400.87 1426.34 1413.28 C 1317.85 1506.69 1181.61 1561.75 1038.68 1569.94 C 871.023 1578.55 706.765 1520.51 581.734 1408.48 C 460.504 1300.66 387.6 1148.71 379.359 986.684 C 370.081 813.168 430.286 643.101 546.668 514.069 C 641.817 407.866 769.378 336.061 909.533 309.811 C 943.426 303.531 970.609 301.201 1004.64 299.434 z"
            className="fill-foreground"
            stroke="currentColor"
            strokeWidth="0"
            fill="currentColor"
            pathLength="1"
            style={{
              // Draw-in: start fully offset (invisible), animate to 0 (fully drawn)
              strokeDasharray: 1,
              strokeDashoffset: hasAnimated ? 0 : 1,
              // Clip opacity so the fill fades in simultaneously with the draw
              opacity: hasAnimated ? 1 : 0,
              transition: hasAnimated
                ? "stroke-dashoffset 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease-out"
                : "none",
            }}
          />

          {/*
           * ── Orange chevron / arrow ─────────────────────────────────────
           * Scales up from 0.6 + fades in, starting after the "C" is ~80%
           * drawn (delay 0.9 s), completing at 1.3 s.
           */}
          <path
            d="M 1563.9 562.895 L 1564.88 564.101 C 1550.38 597.943 1533.36 632.851 1518.18 666.536 C 1475.8 760.625 1430.31 854.248 1388.62 948.573 C 1419.58 1017.09 1449.64 1087.53 1479.57 1156.54 C 1502 1207.38 1524.08 1258.39 1545.81 1309.54 C 1515.09 1293.7 1481.84 1273.73 1451.49 1256.5 L 1240.11 1135.91 C 1216.1 1121.14 1186.15 1104.98 1161.32 1090.8 L 988.642 992.973 C 962.996 978.488 933.365 962.709 908.551 947.375 C 938.512 930.659 970.387 910.845 1000.25 893.246 L 1189.48 781.546 L 1563.9 562.895 z"
            fill="#fe6e01"
            style={{
              transformOrigin: "1200px 950px",
              opacity: hasAnimated ? 1 : 0,
              transform: hasAnimated ? "scale(1)" : "scale(0.65)",
              transition: hasAnimated
                ? "opacity 0.4s ease-out 0.9s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s"
                : "none",
            }}
          />
        </svg>
      </div>

      {/* Pillar labels */}
      <ol className="flex flex-col gap-3 lg:gap-2 list-none p-0 m-0 w-full max-w-[260px]">
        {layers.map((label, i) => (
          <li
            key={label}
            className="flex flex-row items-center gap-4 leading-tight"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transform: hasAnimated ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 0.4s ease-out ${1.2 + i * 0.08}s, transform 0.4s ease-out ${1.2 + i * 0.08}s`,
            }}
          >
            <span className="text-lg lg:text-sm text-primary-text font-bold shrink-0">
              0{i + 1}
            </span>
            <span className="font-display font-semibold text-foreground text-lg lg:text-sm break-words whitespace-normal">
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
