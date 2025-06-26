import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    return config;
  },
  // Add other Next.js config here
};

export default nextConfig;