/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = {
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
}
