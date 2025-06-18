const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')

// Environment variables
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Custom server configuration
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Security headers
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

      // CORS headers for API routes
      if (pathname.startsWith('/api/')) {
        res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.writeHead(200)
          res.end()
          return
        }
      }

      // Custom routes handling
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        }))
        return
      }

      // Redirect old URLs to new structure
      const redirects = {
        '/register': '/dang-ky',
        '/login': '/dang-nhap',
        '/account': '/tai-khoan',
        '/products': '/san-pham',
        '/categories': '/danh-muc'
      }

      if (redirects[pathname]) {
        res.writeHead(301, { Location: redirects[pathname] })
        res.end()
        return
      }

      // Handle static files with caching
      if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/') || pathname.startsWith('/favicon.ico')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }

      // Rate limiting for API routes (simple implementation)
      if (pathname.startsWith('/api/')) {
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        // You can implement more sophisticated rate limiting here
        console.log(`API request from ${clientIP} to ${pathname}`)
      }

      // Log requests in production
      if (!dev) {
        const timestamp = new Date().toISOString()
        const method = req.method
        const userAgent = req.headers['user-agent'] || 'Unknown'
        const referer = req.headers.referer || 'Direct'
        
        console.log(`[${timestamp}] ${method} ${pathname} - ${userAgent} - Referer: ${referer}`)
      }

      // Handle the request with Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
    console.log(`> Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully')
      process.exit(0)
    })
    
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully')
      process.exit(0)
    })
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
