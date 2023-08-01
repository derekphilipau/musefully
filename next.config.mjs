/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1lfxha3ugu3d4.cloudfront.net',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
