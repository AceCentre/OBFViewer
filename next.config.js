/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: true,
  experimental: {
    optimizeCss: true,
  },
  // Disable font optimization in development to avoid ETIMEDOUT errors
  ...(process.env.NODE_ENV === 'development' && {
    optimizeFonts: false,
  }),
}

module.exports = nextConfig
