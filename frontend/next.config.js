/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/oubliette',
  trailingSlash: true,
};

module.exports = nextConfig;
