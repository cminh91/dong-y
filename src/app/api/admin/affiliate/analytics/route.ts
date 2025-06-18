import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/analytics - Lấy dữ liệu analytics tổng quan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    const daysAgo = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get overview stats
    const [
      totalAffiliates,
      activeAffiliates,
      totalLinks,
      totalClicks,
      totalConversions,
      totalCommissions,
      totalWithdrawals
    ] = await Promise.all([
      // Total affiliates
      prisma.user.count({
        where: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ]
        }
      }),
      // Active affiliates (with activity in time range)
      prisma.user.count({
        where: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ],
          status: 'ACTIVE',
          OR: [
            {
              affiliateLinks: {
                some: {
                  clicks: {
                    some: {
                      clickedAt: { gte: startDate }
                    }
                  }
                }
              }
            },
            {
              commissions: {
                some: {
                  createdAt: { gte: startDate }
                }
              }
            }
          ]
        }
      }),
      // Total links
      prisma.affiliateLink.count(),
      // Total clicks
      prisma.affiliateClick.count(),
      // Total conversions
      prisma.affiliateConversion.aggregate({
        _count: { id: true },
        _sum: { 
          orderValue: true,
          commissionAmount: true 
        }
      }),
      // Total commissions
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: {
          user: {
            OR: [
              { role: 'COLLABORATOR' },
              { role: 'AGENT' },
              { referralCode: { not: null } }
            ]
          }
        }
      }),
      // Total withdrawals
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: {
          user: {
            OR: [
              { role: 'COLLABORATOR' },
              { role: 'AGENT' },
              { referralCode: { not: null } }
            ]
          }
        }
      })
    ])

    // Calculate conversion rate and average order value
    const conversionsCount = totalConversions._count || 0
    const conversionRate = totalClicks > 0 ? (conversionsCount / totalClicks) * 100 : 0
    const avgOrderValue = conversionsCount > 0
      ? (totalConversions._sum?.orderValue || 0) / conversionsCount
      : 0

    // Get growth data for previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const [previousAffiliates, previousClicks, previousConversions, previousCommissions] = await Promise.all([
      prisma.user.count({
        where: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ],
          createdAt: { 
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),
      prisma.affiliateClick.count({
        where: {
          clickedAt: { 
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),
      prisma.affiliateConversion.count({
        where: {
          convertedAt: { 
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { 
            gte: previousStartDate,
            lt: startDate
          },
          user: {
            OR: [
              { role: 'COLLABORATOR' },
              { role: 'AGENT' },
              { referralCode: { not: null } }
            ]
          }
        }
      })
    ])

    const currentAffiliates = await prisma.user.count({
      where: {
        OR: [
          { role: 'COLLABORATOR' },
          { role: 'AGENT' },
          { referralCode: { not: null } }
        ],
        createdAt: { gte: startDate }
      }
    })

    const currentClicks = await prisma.affiliateClick.count({
      where: { clickedAt: { gte: startDate } }
    })

    const currentConversions = await prisma.affiliateConversion.count({
      where: { convertedAt: { gte: startDate } }
    })

    const currentCommissions = await prisma.commission.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: startDate },
        user: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ]
        }
      }
    })

    // Calculate growth rates
    const affiliatesGrowth = previousAffiliates > 0 
      ? ((currentAffiliates - previousAffiliates) / previousAffiliates) * 100 
      : currentAffiliates > 0 ? 100 : 0

    const clicksGrowth = previousClicks > 0 
      ? ((currentClicks - previousClicks) / previousClicks) * 100 
      : currentClicks > 0 ? 100 : 0

    const conversionsGrowth = previousConversions > 0 
      ? ((currentConversions - previousConversions) / previousConversions) * 100 
      : currentConversions > 0 ? 100 : 0

    const commissionsGrowth = Number(previousCommissions._sum?.amount || 0) > 0
      ? ((Number(currentCommissions._sum?.amount || 0) - Number(previousCommissions._sum?.amount || 0)) / Number(previousCommissions._sum?.amount || 0)) * 100
      : Number(currentCommissions._sum?.amount || 0) > 0 ? 100 : 0

    // Get top performing affiliates
    const topAffiliates = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'COLLABORATOR' },
          { role: 'AGENT' },
          { referralCode: { not: null } }
        ],
        status: 'ACTIVE'
      },
      include: {
        commissions: {
          where: { status: 'PAID' },
          select: { amount: true }
        },
        affiliateLinks: {
          include: {
            conversions: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: { totalCommission: 'desc' },
      take: 5
    })

    const topAffiliatesWithStats = topAffiliates.map(user => {
      const paidCommissions = user.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
      const totalConversions = user.affiliateLinks.reduce((sum, link) => sum + link.conversions.length, 0)
      
      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        commissions: paidCommissions,
        conversions: totalConversions
      }
    })

    // Get top performing products
    const topProducts = await prisma.product.findMany({
      include: {
        affiliateLinks: {
          include: {
            clicks: { select: { id: true } },
            conversions: {
              select: { 
                orderValue: true,
                commissionAmount: true
              }
            }
          }
        }
      },
      orderBy: {
        affiliateLinks: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const topProductsWithStats = topProducts.map(product => {
      const totalClicks = product.affiliateLinks.reduce((sum, link) => sum + link.clicks.length, 0)
      const totalConversions = product.affiliateLinks.reduce((sum, link) => sum + link.conversions.length, 0)
      const totalRevenue = product.affiliateLinks.reduce((sum, link) => 
        sum + link.conversions.reduce((linkSum, conv) => linkSum + conv.orderValue, 0), 0
      )

      return {
        id: product.id,
        name: product.name,
        clicks: totalClicks,
        conversions: totalConversions,
        revenue: totalRevenue
      }
    })

    const overview = {
      totalAffiliates: totalAffiliates || 0,
      activeAffiliates: activeAffiliates || 0,
      totalLinks: totalLinks || 0,
      totalClicks: totalClicks || 0,
      totalConversions: conversionsCount,
      totalCommissions: Number(totalCommissions._sum?.amount || 0),
      conversionRate: Number(conversionRate.toFixed(2)),
      avgOrderValue: Number(avgOrderValue.toFixed(0))
    }

    const growth = {
      affiliatesGrowth: Number(affiliatesGrowth.toFixed(1)),
      clicksGrowth: Number(clicksGrowth.toFixed(1)),
      conversionsGrowth: Number(conversionsGrowth.toFixed(1)),
      commissionsGrowth: Number(commissionsGrowth.toFixed(1))
    }

    const topPerformers = {
      affiliates: topAffiliatesWithStats,
      products: topProductsWithStats
    }

    return NextResponse.json({
      success: true,
      data: {
        overview,
        growth,
        topPerformers
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
