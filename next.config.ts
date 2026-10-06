import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    imageSizes: [256],
    deviceSizes: [640, 1200],
    formats: ['image/avif', 'image/webp'],
    qualities: [90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
