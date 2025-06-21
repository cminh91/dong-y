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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const whereClause: any = {
      userId: userPayload.userId,
      type: 'PRODUCT' // Only show product links
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { slug: { contains: search } }
      ]
    }

    // Get affiliate links from database
    const [affiliateLinks, totalCount] = await Promise.all([
      prisma.affiliateLink.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true,
              category: {
                select: {
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.affiliateLink.count({
        where: whereClause
      })
    ])

    // Transform data for frontend
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const transformedLinks = affiliateLinks.map(link => {
      // Transform product images
      const product = link.product ? {
        ...link.product,
        images: Array.isArray(link.product.images) ? link.product.images : []
      } : null

      return {
        id: link.id,
        title: link.title,
        slug: link.slug,
        type: link.type,
        status: link.status,
        originalUrl: product ? `/san-pham/${product.slug}` : '/',
        affiliateUrl: `${baseUrl}/aff/${link.slug}`,
        shortCode: link.slug.toUpperCase().substring(0, 6),
        totalClicks: link.totalClicks,
        totalConversions: link.totalConversions,
        totalCommission: Number(link.totalCommission),
        conversionRate: link.totalClicks > 0 ? (link.totalConversions / link.totalClicks) * 100 : 0,
        commissionRate: Number(link.commissionRate),
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
        lastClickAt: link.lastClickAt?.toISOString() || null,
        lastConversionAt: link.lastConversionAt?.toISOString() || null,
        expiresAt: link.expiresAt?.toISOString() || null,
        product
      }
    })

    // Calculate summary statistics
    const allLinks = await prisma.affiliateLink.findMany({
      where: { userId: userPayload.userId },
      select: {
        status: true,
        totalClicks: true,
        totalConversions: true,
        totalCommission: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        links: transformedLinks,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        summary: {
          total: allLinks.length,
          active: allLinks.filter(l => l.status === 'ACTIVE').length,
          inactive: allLinks.filter(l => l.status === 'INACTIVE').length,
          totalClicks: allLinks.reduce((sum, l) => sum + l.totalClicks, 0),
          totalConversions: allLinks.reduce((sum, l) => sum + l.totalConversions, 0),
          totalCommission: allLinks.reduce((sum, l) => sum + Number(l.totalCommission), 0)
        }
      }
    })

  } catch (error) {
    console.error('Links API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Product is not active' },
        { status: 400 }
      )
    }

    // Check if user already has affiliate link for this product
    const existingLink = await prisma.affiliateLink.findFirst({
      where: {
        userId: userPayload.userId,
        productId: productId
      }
    })

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'You already have an affiliate link for this product' },
        { status: 400 }
      )
    }

    // Generate slug from product name
    const slug = `${product.slug}-${userPayload.userId.slice(-6)}`

    // Create affiliate link in database
    const newLink = await prisma.affiliateLink.create({
      data: {
        userId: userPayload.userId,
        title: product.name,
        slug,
        type: 'PRODUCT',
        status: 'ACTIVE',
        productId: productId,
        commissionRate: 0.1, // Default 10% - Admin can change this later
        totalClicks: 0,
        totalConversions: 0,
        totalCommission: 0
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const transformedLink = {
      id: newLink.id,
      title: newLink.title,
      slug: newLink.slug,
      type: newLink.type,
      status: newLink.status,
      originalUrl: newLink.product ? `/san-pham/${newLink.product.slug}` : '/',
      affiliateUrl: `${baseUrl}/aff/${newLink.slug}`,
      shortCode: newLink.slug.toUpperCase().substring(0, 6),
      totalClicks: newLink.totalClicks,
      totalConversions: newLink.totalConversions,
      totalCommission: Number(newLink.totalCommission),
      conversionRate: 0,
      commissionRate: Number(newLink.commissionRate),
      createdAt: newLink.createdAt.toISOString(),
      updatedAt: newLink.updatedAt.toISOString(),
      lastClickAt: null,
      lastConversionAt: null,
      expiresAt: null,
      product: newLink.product
    }

    return NextResponse.json({
      success: true,
      data: { link: transformedLink }
    })

  } catch (error) {
    console.error('Create link API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, title, status, commissionRate } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Check if link belongs to user
    const existingLink = await prisma.affiliateLink.findFirst({
      where: {
        id,
        userId: userPayload.userId
      }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found or access denied' },
        { status: 404 }
      )
    }

    // Update affiliate link
    const updatedLink = await prisma.affiliateLink.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(commissionRate && { commissionRate }),
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const transformedLink = {
      id: updatedLink.id,
      title: updatedLink.title,
      slug: updatedLink.slug,
      type: updatedLink.type,
      status: updatedLink.status,
      originalUrl: updatedLink.product ? `/san-pham/${updatedLink.product.slug}` : '/',
      affiliateUrl: `${baseUrl}/aff/${updatedLink.slug}`,
      shortCode: updatedLink.slug.toUpperCase().substring(0, 6),
      totalClicks: updatedLink.totalClicks,
      totalConversions: updatedLink.totalConversions,
      totalCommission: Number(updatedLink.totalCommission),
      conversionRate: updatedLink.totalClicks > 0 ? (updatedLink.totalConversions / updatedLink.totalClicks) * 100 : 0,
      commissionRate: Number(updatedLink.commissionRate),
      createdAt: updatedLink.createdAt.toISOString(),
      updatedAt: updatedLink.updatedAt.toISOString(),
      product: updatedLink.product
    }

    return NextResponse.json({
      success: true,
      data: { link: transformedLink }
    })

  } catch (error) {
    console.error('Update link API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Check if link belongs to user
    const existingLink = await prisma.affiliateLink.findFirst({
      where: {
        id,
        userId: userPayload.userId
      }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found or access denied' },
        { status: 404 }
      )
    }

    // Delete affiliate link
    await prisma.affiliateLink.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully'
    })

  } catch (error) {
    console.error('Delete link API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
