/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force webpack to avoid SWC binary issues
  webpack: (config, { isServer }) => {
    // Fix for ESM module resolution
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.js'],
    };
    return config;
  },
}

module.exports = nextConfig


