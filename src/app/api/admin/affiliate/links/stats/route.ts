import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/links/stats - Lấy thống kê tổng quan affiliate links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    const daysAgo = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get total links
    const totalLinks = await prisma.affiliateLink.count()

    // Get active links
    const activeLinks = await prisma.affiliateLink.count({
      where: { status: 'ACTIVE' }
    })

    // Get new links in time range
    const newLinks = await prisma.affiliateLink.count({
      where: {
        createdAt: { gte: startDate }
      }
    })

    // Get total clicks
    const totalClicksResult = await prisma.affiliateClick.aggregate({
      _count: { id: true }
    })

    // Get clicks in time range
    const recentClicksResult = await prisma.affiliateClick.aggregate({
      _count: { id: true },
      where: {
        clickedAt: { gte: startDate }
      }
    })

    // Get total conversions
    const totalConversionsResult = await prisma.affiliateConversion.aggregate({
      _count: { id: true },
      _sum: { 
        orderValue: true,
        commissionAmount: true 
      }
    })

    // Get conversions in time range
    const recentConversionsResult = await prisma.affiliateConversion.aggregate({
      _count: { id: true },
      _sum: { 
        orderValue: true,
        commissionAmount: true 
      },
      where: {
        convertedAt: { gte: startDate }
      }
    })

    // Calculate conversion rate
    const totalClicks = totalClicksResult?._count?.id ?? 0
    const totalConversions = totalConversionsResult?._count?.id ?? 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    // Get growth data for previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const previousClicks = await prisma.affiliateClick.count({
      where: {
        clickedAt: { 
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    const previousConversions = await prisma.affiliateConversion.aggregate({
      _count: { id: true },
      _sum: { orderValue: true },
      where: {
        convertedAt: { 
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    // Calculate growth rates
    const clicksGrowth = previousClicks > 0
      ? ((recentClicksResult?._count?.id ?? 0 - previousClicks) / previousClicks) * 100
      : (recentClicksResult?._count?.id ?? 0) > 0 ? 100 : 0

    const conversionsGrowth = (previousConversions?._count?.id ?? 0) > 0
      ? (((recentConversionsResult?._count?.id ?? 0) - (previousConversions?._count?.id ?? 0)) / (previousConversions?._count?.id ?? 0)) * 100
      : (recentConversionsResult?._count?.id ?? 0) > 0 ? 100 : 0

    // Get top performing links
    const topLinks = await prisma.affiliateLink.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        product: {
          select: {
            name: true,
            slug: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        clicks: {
          select: { id: true }
        },
        conversions: {
          select: { 
            orderValue: true,
            commissionAmount: true
          }
        }
      },
      orderBy: {
        conversions: {
          _count: 'desc'
        }
      },
      take: 10
    })

    const topLinksWithStats = topLinks.map(link => {
      const totalClicks = link.clicks.length
      const totalConversions = link.conversions.length
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      const totalRevenue = link.conversions.reduce((sum, c) => sum + c.orderValue, 0)
      const totalCommissions = link.conversions.reduce((sum, c) => sum + c.commissionAmount, 0)

      return {
        id: link.id,
        slug: link.slug,
        type: link.type,
        status: link.status,
        user: link.user,
        product: link.product,
        category: link.category,
        stats: {
          totalClicks,
          totalConversions,
          conversionRate: Number(conversionRate.toFixed(2)),
          totalRevenue,
          totalCommissions
        }
      }
    })

    // Get daily performance data for charts
    const dailyStats = []
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const [dayClicks, dayConversions] = await Promise.all([
        prisma.affiliateClick.count({
          where: {
            clickedAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.affiliateConversion.aggregate({
          _count: { id: true },
          _sum: { 
            orderValue: true,
            commissionAmount: true 
          },
          where: {
            convertedAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        })
      ])

      dailyStats.push({
        date: dateStr,
        clicks: dayClicks,
        conversions: dayConversions._count || 0,
        revenue: dayConversions._sum?.orderValue || 0,
        commissions: dayConversions._sum?.commissionAmount || 0
      })
    }

    const stats = {
      totalLinks,
      activeLinks,
      newLinks,
      totalClicks,
      recentClicks: recentClicksResult._count || 0,
      totalConversions,
      recentConversions: recentConversionsResult._count || 0,
      totalRevenue: totalConversionsResult._sum?.orderValue || 0,
      recentRevenue: recentConversionsResult._sum?.orderValue || 0,
      totalCommissions: totalConversionsResult._sum?.commissionAmount || 0,
      recentCommissions: recentConversionsResult._sum?.commissionAmount || 0,
      conversionRate: Number(conversionRate.toFixed(2)),
      growth: {
        clicksGrowth: Number(clicksGrowth.toFixed(1)),
        conversionsGrowth: Number(conversionsGrowth.toFixed(1))
      },
      topLinks: topLinksWithStats,
      dailyStats
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching affiliate links stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
