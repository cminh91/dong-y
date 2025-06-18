import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canCreateMoreLinks, getLinksSettings, getCommissionSettings } from '@/lib/affiliate-settings'

// GET /api/admin/affiliate/links - Lấy danh sách affiliate links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { slug: { contains: search } },
        { user: {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } }
          ]
        }},
        { product: { name: { contains: search } } },
        { category: { name: { contains: search } } }
      ]
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (userId) {
      where.userId = userId
    }

    // Get links with pagination
    const [links, total] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              referralCode: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          clicks: {
            select: { 
              id: true,
              clickedAt: true,
              ipAddress: true
            }
          },
          conversions: {
            select: {
              id: true,
              orderValue: true,
              commissionAmount: true,
              convertedAt: true
            }
          }
        }
      }),
      prisma.affiliateLink.count({ where })
    ])

    // Calculate stats for each link
    const linksWithStats = links.map(link => {
      const totalClicks = link.clicks.length
      const totalConversions = link.conversions.length
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      const totalRevenue = link.conversions.reduce((sum, c) => sum + c.orderValue, 0)
      const totalCommissions = link.conversions.reduce((sum, c) => sum + c.commissionAmount, 0)

      // Get recent clicks (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentClicks = link.clicks.filter(c => new Date(c.clickedAt) >= sevenDaysAgo).length

      return {
        id: link.id,
        slug: link.slug,
        type: link.type,
        status: link.status,
        commissionRate: link.commissionRate,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        expiresAt: link.expiresAt,
        user: link.user,
        product: link.product ? {
          ...link.product,
          price: Number(link.product.price),
          salePrice: link.product.salePrice ? Number(link.product.salePrice) : null
        } : null,
        category: link.category,
        stats: {
          totalClicks,
          totalConversions,
          conversionRate: Number(conversionRate.toFixed(2)),
          totalRevenue,
          totalCommissions,
          recentClicks
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        links: linksWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching affiliate links:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/affiliate/links - Tạo affiliate link mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      type,
      productId,
      categoryId,
      customSlug,
      title,
      description,
      commissionRate,
      expiresAt
    } = body

    // Validate required fields
    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type and related fields
    if (type === 'PRODUCT' && !productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for product links' },
        { status: 400 }
      )
    }

    if (type === 'CATEGORY' && !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required for category links' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user can create more links based on settings
    const userLinksCount = await prisma.affiliateLink.count({
      where: { userId, status: 'ACTIVE' }
    })

    const canCreate = await canCreateMoreLinks(userLinksCount)
    if (!canCreate) {
      const linksSettings = await getLinksSettings()
      return NextResponse.json(
        { success: false, error: `Maximum links limit reached (${linksSettings.maxLinksPerUser})` },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug: string
    if (customSlug) {
      // Check if custom slug is available
      const existingLink = await prisma.affiliateLink.findUnique({
        where: { slug: customSlug }
      })
      
      if (existingLink) {
        return NextResponse.json(
          { success: false, error: 'Custom slug already exists' },
          { status: 400 }
        )
      }
      slug = customSlug
    } else {
      // Generate automatic slug
      let isUnique = false
      while (!isUnique) {
        slug = `${user.referralCode || 'AF'}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5)}`
        const existing = await prisma.affiliateLink.findUnique({
          where: { slug }
        })
        if (!existing) isUnique = true
      }
    }

    // Get commission rate from settings if not provided
    let finalCommissionRate = commissionRate
    if (!finalCommissionRate) {
      const commissionSettings = await getCommissionSettings()
      finalCommissionRate = commissionSettings.defaultRate
    }

    // Get link expiry from settings if not provided
    let finalExpiresAt = expiresAt ? new Date(expiresAt) : null
    if (!finalExpiresAt) {
      const linksSettings = await getLinksSettings()
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + linksSettings.linkExpiry)
      finalExpiresAt = expiryDate
    }

    // Create affiliate link
    const link = await prisma.affiliateLink.create({
      data: {
        userId,
        slug: slug!,
        type: type.toUpperCase(),
        productId: productId || null,
        categoryId: categoryId || null,
        title: title || (type === 'PRODUCT' ? 'Product Link' : type === 'CATEGORY' ? 'Category Link' : 'General Link'),
        description: description || null,
        commissionRate: finalCommissionRate,
        status: 'ACTIVE',
        expiresAt: finalExpiresAt
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            referralCode: true
          }
        },
        product: {
          select: {
            name: true,
            slug: true,
            price: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        slug: link.slug,
        type: link.type,
        status: link.status,
        commissionRate: link.commissionRate,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        user: link.user,
        product: link.product ? {
          ...link.product,
          price: Number(link.product.price)
        } : null,
        category: link.category,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/aff/${link.slug}`
      }
    })

  } catch (error) {
    console.error('Error creating affiliate link:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
