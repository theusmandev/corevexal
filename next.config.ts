import type { NextConfig } from "next";

/**
 * Allowed origins for the frame-src Content-Security-Policy directive.
 * These MUST match the two canonical embed origins used in:
 *   - reParseVideoEmbedSrc()  (validate-blog-content.ts)
 *   - BlogRenderer videoEmbed (blog-renderer.tsx)
 */
const FRAME_SRC_ORIGINS = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://player.vimeo.com",
].join(" ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply the frame-src CSP to all routes so every page that
        // embeds a video is protected. 'self' allows the app's own
        // frames (e.g. admin preview iframes) in addition to video hosts.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-src 'self' ${FRAME_SRC_ORIGINS};`,
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/portal/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
