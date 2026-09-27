/**
 * blog-editor.test.mjs
 *
 * Node.js built-in test runner tests for:
 *   1. parseVideoUrl — domain validation and embed URL conversion
 *   2. sanitizeBlogHtml — XSS prevention including the explicit test case
 *      from the task requirements
 *
 * Run with:  node --experimental-vm-modules tests/blog-editor.test.mjs
 * Or:        node --test tests/blog-editor.test.mjs
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ── Import compiled TypeScript via tsx/ts-node shim ──────────────────────
// We use a dynamic import with tsx registered in the node options to allow
// importing .ts source files directly in a .mjs test file.

const { parseVideoUrl, isAllowedVideoHost } =
  await import("../src/components/admin/video-embed-extension.ts");

const { sanitizeBlogHtml } = await import("../src/components/admin/sanitize-blog-html.ts");

// ═══════════════════════════════════════════════════════════════════════════
// 1. parseVideoUrl — domain validation
// ═══════════════════════════════════════════════════════════════════════════

describe("parseVideoUrl", () => {
  // ── YouTube watch URLs ───────────────────────────────────────────────────
  test("accepts youtube.com/watch?v=ID", () => {
    const result = parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    assert.ok(result, "should return a result");
    assert.equal(result.provider, "youtube");
    assert.equal(result.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  test("accepts youtu.be short URL", () => {
    const result = parseVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    assert.ok(result);
    assert.equal(result.provider, "youtube");
    assert.equal(result.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  test("accepts youtu.be short URL without protocol", () => {
    const result = parseVideoUrl("youtu.be/dQw4w9WgXcQ");
    assert.ok(result);
    assert.equal(result.provider, "youtube");
  });

  test("accepts youtube.com/embed/ID URL", () => {
    const result = parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
    assert.ok(result);
    assert.equal(result.embedUrl, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  // ── Vimeo URLs ────────────────────────────────────────────────────────────
  test("accepts vimeo.com/ID", () => {
    const result = parseVideoUrl("https://vimeo.com/123456789");
    assert.ok(result);
    assert.equal(result.provider, "vimeo");
    assert.equal(result.embedUrl, "https://player.vimeo.com/video/123456789");
  });

  test("accepts vimeo.com/video/ID", () => {
    const result = parseVideoUrl("https://vimeo.com/video/123456789");
    assert.ok(result);
    assert.equal(result.provider, "vimeo");
    assert.equal(result.embedUrl, "https://player.vimeo.com/video/123456789");
  });

  // ── REJECTED domains (the critical security tests) ────────────────────────
  test("rejects non-YouTube/Vimeo URL — dailymotion", () => {
    const result = parseVideoUrl("https://www.dailymotion.com/video/x123abc");
    assert.equal(result, null, "dailymotion.com must be rejected with null");
  });

  test("rejects non-YouTube/Vimeo URL — arbitrary domain", () => {
    const result = parseVideoUrl("https://evil.example.com/embed/xss");
    assert.equal(result, null, "arbitrary domain must be rejected with null");
  });

  test("rejects totally invalid URL", () => {
    const result = parseVideoUrl("not-a-url-at-all");
    assert.equal(result, null);
  });

  test("rejects YouTube URL with missing video ID", () => {
    const result = parseVideoUrl("https://www.youtube.com/watch");
    assert.equal(result, null);
  });

  test("rejects YouTube URL with malformed/too-short ID", () => {
    const result = parseVideoUrl("https://www.youtube.com/watch?v=SHORT");
    assert.equal(result, null);
  });

  // ── isAllowedVideoHost helper ─────────────────────────────────────────────
  test("isAllowedVideoHost returns true for youtube.com", () => {
    assert.equal(isAllowedVideoHost("https://www.youtube.com/watch?v=abc"), true);
  });

  test("isAllowedVideoHost returns true for vimeo.com", () => {
    assert.equal(isAllowedVideoHost("https://vimeo.com/123"), true);
  });

  test("isAllowedVideoHost returns false for twitch.tv", () => {
    assert.equal(isAllowedVideoHost("https://www.twitch.tv/videos/123"), false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. sanitizeBlogHtml — XSS prevention
// ═══════════════════════════════════════════════════════════════════════════

describe("sanitizeBlogHtml — XSS prevention", () => {
  // ── THE EXPLICIT XSS TEST FROM THE TASK REQUIREMENTS ─────────────────────
  //
  // Input:  <script>alert('xss')</script><h2>Test</h2>
  // Expected:
  //   (a) No alert fires (trivially true in Node.js; proved by absence of
  //       <script> in output)
  //   (b) The script tag is completely gone from the saved content
  //   (c) The h2 "Test" heading is preserved correctly
  //
  test("ITEM 2 XSS TEST: strips <script> and preserves <h2>", () => {
    const input = "<script>alert('xss')</script><h2>Test</h2>";
    const { html, wasModified } = sanitizeBlogHtml(input);

    console.log("  Before:", JSON.stringify(input));
    console.log("  After: ", JSON.stringify(html));

    // (a+b) No script tag in output
    assert.ok(!html.includes("<script"), "output must not contain <script");
    assert.ok(!html.includes("alert"), "output must not contain alert()");

    // (c) h2 heading preserved
    assert.ok(html.includes("<h2>Test</h2>"), "h2 'Test' must be preserved");

    // wasModified must be true because content was stripped
    assert.equal(wasModified, true);
  });

  test("strips <iframe> tags (raw iframes are not allowed)", () => {
    const input = '<p>hello</p><iframe src="https://evil.example.com"></iframe>';
    const { html } = sanitizeBlogHtml(input);
    assert.ok(!html.includes("<iframe"), "iframe must be stripped");
    assert.ok(html.includes("<p>hello</p>"), "paragraph must be preserved");
  });

  test("strips onclick and other on* event handlers", () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const { html } = sanitizeBlogHtml(input);
    assert.ok(!html.includes("onclick"), "onclick must be stripped");
    assert.ok(html.includes("Click me"), "text content must be preserved");
  });

  test("strips style attribute", () => {
    const input = '<p style="color:red">Styled</p>';
    const { html } = sanitizeBlogHtml(input);
    assert.ok(!html.includes('style="color'), "style attribute must be stripped");
    assert.ok(html.includes("Styled"));
  });

  test("preserves allowed tags: h2, h3, p, strong, em, u, s, ul, ol, li, blockquote, a, img, hr", () => {
    const input = [
      "<h2>Heading 2</h2>",
      "<h3>Heading 3</h3>",
      "<p>Para</p>",
      "<p><strong>Bold</strong> and <em>italic</em> and <u>under</u> and <s>strike</s></p>",
      "<ul><li>item</li></ul>",
      "<ol><li>ordered</li></ol>",
      "<blockquote>quote</blockquote>",
      '<a href="https://example.com">link</a>',
      '<img src="https://example.com/img.png" alt="img" />',
      "<hr />",
    ].join("\n");

    const { html } = sanitizeBlogHtml(input);

    assert.ok(html.includes("<h2>Heading 2</h2>"));
    assert.ok(html.includes("<h3>Heading 3</h3>"));
    assert.ok(html.includes("<p>Para</p>"));
    assert.ok(html.includes("<strong>Bold</strong>"));
    assert.ok(html.includes("<em>italic</em>"));
    assert.ok(html.includes("<u>under</u>"));
    assert.ok(html.includes("<s>strike</s>"));
    assert.ok(html.includes("<li>item</li>"));
    assert.ok(html.includes("<li>ordered</li>"));
    assert.ok(html.includes("<blockquote>quote</blockquote>"));
    assert.ok(html.includes('href="https://example.com"'));
    assert.ok(html.includes('src="https://example.com/img.png"'));
    assert.ok(html.includes("<hr"));
  });

  test("strips javascript: protocol from href", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const { html } = sanitizeBlogHtml(input);
    assert.ok(!html.includes("javascript:"), "javascript: protocol must be stripped");
  });

  test("strips data: protocol from img src", () => {
    const input = '<img src="data:image/png;base64,abc" alt="x">';
    const { html } = sanitizeBlogHtml(input);
    assert.ok(!html.includes("data:"), "data: URI must be stripped from img src");
  });

  test("wasModified is false for clean allowed HTML", () => {
    const input = "<h2>Clean</h2><p>Normal content.</p>";
    const { wasModified } = sanitizeBlogHtml(input);
    assert.equal(wasModified, false);
  });
});
