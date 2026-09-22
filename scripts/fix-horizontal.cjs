const fs = require("fs");

async function main() {
  const logoFull = fs.readFileSync("public/brand/logo-full.svg", "utf8");
  const matches = logoFull.match(/<path[^>]*>/g);

  // Path 2 and Path 3 contain the wordmark (no tagline)
  let wordmarkPaths = matches[2] + "\n" + matches[3];

  // The original wordmark is placed at X=1566.4, Y=0.
  // In our 800x200 viewBox for horizontal logo:
  // Center is roughly Y=100.
  // Geometric mark is approx 180x180, placed near X=20, Y=10.

  const horizontalSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" aria-label="Corevexal" role="img">
    <g transform="translate(10, 10)">
      <path class="c" d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
      <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
    </g>
    <!-- Traced wordmark -->
    <g transform="translate(200, 30) scale(0.12)">
      ${wordmarkPaths.replace(/transform="[^"]*"/g, "")}
    </g>
  </svg>`.trim();

  // For reversed:
  const horizontalReversedSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" aria-label="Corevexal" role="img">
    <g transform="translate(10, 10)">
      <path class="c" d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#ffffff" />
      <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
    </g>
    <!-- Traced wordmark -->
    <g transform="translate(200, 30) scale(0.12)">
      ${wordmarkPaths.replace(/transform="[^"]*"/g, "").replace(/#16202b/g, "#ffffff")}
    </g>
  </svg>`.trim();

  fs.writeFileSync("public/brand/logo-horizontal.svg", horizontalSvg);
  fs.writeFileSync("public/brand/logo-horizontal-reversed.svg", horizontalReversedSvg);
  console.log("Regenerated horizontal SVGs with precise wordmark vectors.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
