/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Removed 'standalone' output to fix static generation errors
  // with dynamic pages using useSearchParams()
  // Environment variables are automatically available via NEXT_PUBLIC_ prefix
}

export default nextConfig

