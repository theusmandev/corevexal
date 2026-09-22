const sharp = require("sharp");
const fs = require("fs");

async function main() {
  const logoFull = fs.readFileSync("public/brand/logo-full.svg", "utf8");
  const matches = logoFull.match(/<path[^>]*>/g);

  // The traced text (Wordmark + Tagline)
  const textPaths = matches.slice(2).join("\n");

  // We want to reconstruct the exact 2462 x 1959 lockup layout from logo-full.svg.
  // In logo-full.svg, the text paths are perfectly positioned relative to X=0.
  // We just need to place our geometric mark at X=0, Y=0 but scaled to fill
  // the area of the broken mark (which roughly went up to 1425 x 1584).
  // Our geometric mark has a natural bounding box size of ~160x160 and center at 100,100.
  // We will scale it by 10 to be ~1600x1600.

  const reconstructedLockupSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2462 1959">
    <g transform="translate(-150, 0) scale(10)">
      <path class="c" d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
      <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
    </g>
    ${textPaths}
  </svg>`;

  // Now for the OG image (1200x630), we will place the reconstructed lockup in the center.
  // The aspect ratio of 2462x1959 is wider than 1200x630? No, 1200/630 = 1.9. 2462/1959 = 1.25.
  // So height bounds it. Max height = 400 (leave padding). Scale = 400/1959 = ~0.2.
  // Scaled width = 2462 * 0.2 = 492.
  // Centered X = (1200 - 492) / 2 = 354. Centered Y = (630 - 400) / 2 = 115.

  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <rect width="1200" height="630" fill="#ffffff" />
    <g transform="translate(354, 115) scale(0.2)">
      <!-- Geometric Mark scaled to match broken mark area -->
      <g transform="translate(-50, 0) scale(10)">
        <path d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
        <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
      </g>
      <!-- Original Vector Traced Text (Wordmark + Tagline) -->
      ${textPaths}
    </g>
  </svg>`;

  const ogBuffer = await sharp(Buffer.from(ogSvg)).png().toBuffer();
  fs.writeFileSync("src/app/opengraph-image.png", ogBuffer);
  fs.writeFileSync("src/app/twitter-image.png", ogBuffer);
  console.log("Regenerated opengraph-image.png and twitter-image.png using true lockup layout.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
