import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No redirects for services. Single-segment URLs like /services/uk-ltd-formation 
  // and category URLs like /services/payment-platforms/[platform] serve content directly.
};

export default nextConfig;
