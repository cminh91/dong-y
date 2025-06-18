import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/links/[id] - Lấy thông tin chi tiết affiliate link
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const link = await prisma.affiliateLink.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
            affiliateLevel: true
          }
        },
        product: {
          select: {
            id: true,
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
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100, // Last 100 clicks
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            referer: true,
            clickedAt: true
          }
        },
        conversions: {
          orderBy: { convertedAt: 'desc' },
          select: {
            id: true,
            orderId: true,
            orderValue: true,
            commissionRate: true,
            commissionAmount: true,
            convertedAt: true
          }
        }
      }
    })

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Calculate detailed stats
    const totalClicks = link.clicks.length
    const totalConversions = link.conversions.length
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const totalRevenue = link.conversions.reduce((sum, c) => sum + c.orderValue, 0)
    const totalCommissions = link.conversions.reduce((sum, c) => sum + c.commissionAmount, 0)

    // Calculate daily stats for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayClicks = link.clicks.filter(c => 
        c.clickedAt.toISOString().split('T')[0] === dateStr
      ).length

      const dayConversions = link.conversions.filter(c => 
        c.convertedAt.toISOString().split('T')[0] === dateStr
      ).length

      const dayRevenue = link.conversions
        .filter(c => c.convertedAt.toISOString().split('T')[0] === dateStr)
        .reduce((sum, c) => sum + c.orderValue, 0)

      dailyStats.push({
        date: dateStr,
        clicks: dayClicks,
        conversions: dayConversions,
        revenue: dayRevenue
      })
    }

    // Get top referrers
    const referrerStats = link.clicks.reduce((acc: any, click) => {
      const referer = click.referer || 'Direct'
      if (!acc[referer]) {
        acc[referer] = 0
      }
      acc[referer]++
      return acc
    }, {})

    const topReferrers = Object.entries(referrerStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([referer, count]) => ({ referer, count }))

    const linkWithStats = {
      ...link,
      commissionRate: link.commissionRate,
      product: link.product ? {
        ...link.product,
        price: Number(link.product.price),
        salePrice: link.product.salePrice ? Number(link.product.salePrice) : null
      } : null,
      stats: {
        totalClicks,
        totalConversions,
        conversionRate: Number(conversionRate.toFixed(2)),
        totalRevenue,
        totalCommissions,
        dailyStats,
        topReferrers
      },
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/aff/${link.slug}`
    }

    return NextResponse.json({
      success: true,
      data: linkWithStats
    })

  } catch (error) {
    console.error('Error fetching affiliate link:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/affiliate/links/[id] - Cập nhật affiliate link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      status,
      commissionRate,
      expiresAt,
      customSlug
    } = body

    // Check if link exists
    const existingLink = await prisma.affiliateLink.findUnique({
      where: { id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status !== undefined) updateData.status = status.toUpperCase()
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null

    // Handle custom slug update
    if (customSlug !== undefined && customSlug !== existingLink.slug) {
      // Check if new slug is available
      const existingSlug = await prisma.affiliateLink.findUnique({
        where: { slug: customSlug }
      })
      
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        )
      }
      updateData.slug = customSlug
    }

    // Update link
    const updatedLink = await prisma.affiliateLink.update({
      where: { id },
      data: updateData,
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
        id: updatedLink.id,
        slug: updatedLink.slug,
        type: updatedLink.type,
        status: updatedLink.status,
        commissionRate: updatedLink.commissionRate,
        expiresAt: updatedLink.expiresAt,
        updatedAt: updatedLink.updatedAt,
        user: updatedLink.user,
        product: updatedLink.product ? {
          ...updatedLink.product,
          price: Number(updatedLink.product.price)
        } : null,
        category: updatedLink.category,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/aff/${updatedLink.slug}`
      }
    })

  } catch (error) {
    console.error('Error updating affiliate link:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/affiliate/links/[id] - Xóa affiliate link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if link exists
    const existingLink = await prisma.affiliateLink.findUnique({
      where: { id },
      include: {
        conversions: true
      }
    })

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Check if link has conversions
    if (existingLink.conversions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete link with existing conversions. Please deactivate instead.' 
        },
        { status: 400 }
      )
    }

    // Delete the link (this will cascade delete clicks)
    await prisma.affiliateLink.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting affiliate link:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
