/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Thêm dòng này để build standalone
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // serverExternalPackages: ['sonner'], // Commented out to avoid conflicts
}

module.exports = nextConfig