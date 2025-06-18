import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is affiliate
    if (userPayload.role !== 'COLLABORATOR' && userPayload.role !== 'AGENT') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause for search
    const whereClause: any = {
      status: 'ACTIVE' // Only show active products
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Get products from database
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          salePrice: true,
          images: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          // Check if user already has affiliate link for this product
          affiliateLinks: {
            where: {
              userId: userPayload.userId
            },
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({
        where: whereClause
      })
    ])

    // Transform data for frontend
    const transformedProducts = products.map(product => {
      // Get first image from images array
      const images = Array.isArray(product.images) ? product.images : []
      const firstImage = images.length > 0 ? images[0] : null

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        imageUrl: firstImage,
        status: product.status,
        category: product.category,
        hasAffiliateLink: product.affiliateLinks.length > 0,
        affiliateLinkStatus: product.affiliateLinks[0]?.status || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
