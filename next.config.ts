import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL || '',
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: 'sasi-dashboard',
  silent: !process.env.CI,
});
