import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable better HMR for WSL2 with webpack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second (better for WSL2)
        aggregateTimeout: 300, // Delay before rebuilding once the first file changed
        ignored: /node_modules/,
      };
    }
    return config;
  },
  // Turbopack configuration (for when using --turbo flag)
  turbopack: {
    // Turbopack options can be added here if needed
  },
  // Ensure fast refresh works properly
  reactStrictMode: true,
};

export default nextConfig;
