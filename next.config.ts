import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Apply iframe headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://flowslash.com http://localhost:3000",
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
