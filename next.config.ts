import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Turbopack configuration (for when using --turbo flag)
  // Enabled by default in package.json scripts
  experimental: {
    // Turbopack options can be added here if needed
  },

  // Ensure fast refresh works properly
  reactStrictMode: true,

  // Redirects or other configs can go here
};

export default nextConfig;
