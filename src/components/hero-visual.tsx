import React from "react";

const layers = ["Business", "Formation", "Financial Infrastructure", "Payments", "Digital Growth"];

export function HeroVisual() {
  return (
    <div
      className="flex flex-row items-center gap-4 sm:gap-8 w-full max-w-2xl mx-auto"
      aria-label="Concentric diagram showing 5 stages of business growth: Business, Formation, Financial Infrastructure, Payments, and Digital Growth."
    >
      {/* SVG Diagram */}
      <div className="relative flex-1 max-w-[240px] sm:max-w-[320px] aspect-square shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden="true">
          {/* Orange core */}
          <circle cx="50" cy="50" r="4" className="fill-primary" />

          {/* 5 Concentric open arcs (C shapes) */}
          {layers.map((_, i) => {
            const r = 12 + i * 9;

            // Gap of 70 degrees on the right. Starts at 35 degrees, ends at 325 degrees
            const startAngle = (35 * Math.PI) / 180;
            const endAngle = (325 * Math.PI) / 180;

            const startX = 50 + r * Math.cos(startAngle);
            const startY = 50 + r * Math.sin(startAngle);
            const endX = 50 + r * Math.cos(endAngle);
            const endY = 50 + r * Math.sin(endAngle);

            const pathData = `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`;

            // Marker at 35 degrees (start of the arc)
            const markerX = startX;
            const markerY = startY;

            return (
              <g key={`arc-${i}`}>
                <path
                  d={pathData}
                  fill="none"
                  className="stroke-border"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="3"
                  className="fill-background stroke-border"
                  strokeWidth="0.5"
                />
                <text
                  x={markerX}
                  y={markerY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground text-[3px] font-mono font-bold"
                >
                  0{i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Labels aligned column */}
      <ol className="flex flex-col gap-3 sm:gap-5 flex-1 list-none p-0 m-0 min-w-[120px]">
        {layers.map((label, i) => (
          <li
            key={label}
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 leading-tight"
          >
            <span className="font-mono text-xs sm:text-sm text-primary-text font-bold">
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
