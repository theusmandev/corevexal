import fs from "fs";
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { fileURLToPath, pathToFileURL } from "url";

// Use esbuild to bundle the renderer and test on the fly
const { buildSync } = await import("esbuild");

const tempFile = fileURLToPath(new URL("./blog-renderer.test-temp.cjs", import.meta.url));

try {
  buildSync({
    entryPoints: [fileURLToPath(new URL("./blog-renderer.test-runner.tsx", import.meta.url))],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: tempFile,
    packages: "external",
    external: ["node:test", "node:assert/strict"],
  });

  const module = await import(pathToFileURL(tempFile).href);
  // test runner will run the imported tests
} catch (e) {
  console.error("esbuild failed:", e);
  throw e;
} finally {
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
}
