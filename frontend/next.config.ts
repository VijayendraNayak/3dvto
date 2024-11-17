import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match all API requests
        destination: 'http://127.0.0.1:5000/:path*', // Forward them to the backend
      },
    ];
  },
};

export default nextConfig;
