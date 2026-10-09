/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid Windows file system locking issues with webpack packfile cache
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
