import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel deployment configuration */
  // reactCompiler: true, // Temporarily disabled due to Turbopack compatibility
  
  // Optimize for production
  reactStrictMode: true,
  
  // Ensure proper output for Vercel
  output: 'standalone',
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.app',
      },
    ],
  },
};

export default nextConfig;
