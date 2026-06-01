import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  // PWA headers for service worker scope
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/sw.js',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          ],
        },
        {
          source: '/manifest.json',
          headers: [
            { key: 'Content-Type', value: 'application/manifest+json' },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
