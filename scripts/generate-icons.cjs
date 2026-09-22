const sharp = require("sharp");
const fs = require("fs");

async function main() {
  console.log("Generating apple-icon.png...");
  const appleIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="180" height="180">
    <rect width="200" height="200" fill="#ffffff" />
    <g transform="translate(20, 20) scale(0.8)">
      <path d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
      <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
    </g>
  </svg>`;

  await sharp(Buffer.from(appleIconSvg)).png().toFile("src/app/apple-icon.png");
  console.log("apple-icon.png generated.");

  console.log("Generating opengraph-image.png and twitter-image.png...");
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <rect width="1200" height="630" fill="#ffffff" />
    <g transform="translate(180, 215)">
      <path d="M 156.5 43.5 A 80 80 0 1 0 156.5 156.5 L 135.3 135.3 A 50 50 0 1 1 135.3 64.7 Z" fill="#16202b" />
      <path d="M 130 65 L 175 100 L 130 135 Q 145 100 130 65 Z" fill="#fc6b0c" />
      <text x="210" y="125" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="80" fill="#16202b" letter-spacing="-2">COREVEXAL</text>
      <text x="215" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="24" fill="#64748b" letter-spacing="1">BUSINESS FORMATION &amp; FINANCIAL SOLUTIONS</text>
    </g>
  </svg>`;

  const ogBuffer = await sharp(Buffer.from(ogSvg)).png().toBuffer();
  fs.writeFileSync("src/app/opengraph-image.png", ogBuffer);
  fs.writeFileSync("src/app/twitter-image.png", ogBuffer);
  console.log("opengraph-image.png and twitter-image.png generated.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
