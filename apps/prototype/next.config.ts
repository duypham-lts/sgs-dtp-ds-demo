import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Graphite port ships TypeScript source; Next compiles it with the app.
  transpilePackages: ['@sgs/graphite'],
  reactStrictMode: true,
};

export default nextConfig;
