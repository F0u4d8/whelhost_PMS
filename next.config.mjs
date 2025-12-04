/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false, // Disable source maps in production to avoid parsing issues
  experimental: {
    turbo: false, // Disable Turbopack to avoid source map issues
  },
}

export default nextConfig
