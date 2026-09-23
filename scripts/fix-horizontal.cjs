const fs = require("fs");
const horizontalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" aria-label="Corevexal" role="img">
  <g transform="translate(10, 10)">
    <path d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
    <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
  </g>
  <text x="210" y="125" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="80" fill="#16202b" letter-spacing="-2">COREVEXAL</text>
</svg>`.trim();

const horizontalReversedSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" aria-label="Corevexal" role="img">
  <g transform="translate(10, 10)">
    <path d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#ffffff" />
    <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
  </g>
  <text x="210" y="125" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="80" fill="#ffffff" letter-spacing="-2">COREVEXAL</text>
</svg>`.trim();

fs.writeFileSync("public/brand/logo-horizontal.svg", horizontalSvg);
fs.writeFileSync("public/brand/logo-horizontal-reversed.svg", horizontalReversedSvg);
console.log("Rewrote clean text-based SVG logos.");
