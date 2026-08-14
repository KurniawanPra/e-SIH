/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = (process.env.INTERNAL_BACKEND_URL || 'http://e-sih-be:3000').replace(/\/$/, '')
    return [
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: '/api/esih/:path*',
        destination: `${backendUrl}/api/esih/:path*`,
      },
      {
        source: '/api/portal/:path*',
        destination: `${backendUrl}/api/portal/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/api/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
