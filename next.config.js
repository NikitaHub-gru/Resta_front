/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
