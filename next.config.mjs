/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'du4k8n4cfrb42.cloudfront.net', // test
      },
      {
        protocol: 'https',
        hostname: 'd3uwpjdaha8b4m.cloudfront.net', // prod
      },
    ],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
