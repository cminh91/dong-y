import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/commissions/stats - Lấy thống kê tổng quan commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    const daysAgo = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get total commissions by status
    const [totalCommissions, pendingCommissions, paidCommissions, cancelledCommissions] = await Promise.all([
      prisma.commission.aggregate({
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.commission.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.commission.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      prisma.commission.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'CANCELLED' }
      })
    ])

    // Get commissions in time range
    const recentCommissions = await prisma.commission.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: {
        createdAt: { gte: startDate }
      }
    })

    // Get growth data for previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const previousCommissions = await prisma.commission.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: {
        createdAt: { 
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    // Calculate growth rates
    const commissionsGrowth = (previousCommissions._count || 0) > 0
      ? (((recentCommissions._count || 0) - (previousCommissions._count || 0)) / (previousCommissions._count || 0)) * 100
      : (recentCommissions._count || 0) > 0 ? 100 : 0

    const amountGrowth = Number(previousCommissions._sum?.amount || 0) > 0
      ? ((Number(recentCommissions._sum?.amount || 0) - Number(previousCommissions._sum?.amount || 0)) / Number(previousCommissions._sum?.amount || 0)) * 100
      : Number(recentCommissions._sum?.amount || 0) > 0 ? 100 : 0

    // Get top earning affiliates
    const topAffiliates = await prisma.user.findMany({
      where: {
        commissions: {
          some: {
            status: 'PAID'
          }
        }
      },
      include: {
        commissions: {
          where: { status: 'PAID' },
          select: { amount: true }
        }
      },
      orderBy: {
        totalCommission: 'desc'
      },
      take: 10
    })

    const topAffiliatesWithStats = topAffiliates.map(user => {
      const paidCommissions = user.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        totalCommission: Number(user.totalCommission),
        paidCommissions,
        commissionsCount: user.commissions.length
      }
    })

    // Get commission distribution by level
    const levelDistribution = await prisma.commission.groupBy({
      by: ['level'],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { level: 'asc' }
    })

    const levelStats = levelDistribution.map(level => ({
      level: level.level,
      count: level._count.id,
      totalAmount: Number(level._sum.amount || 0)
    }))

    // Get daily commission data for charts
    const dailyStats = []
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const [dayCommissions, dayPaid] = await Promise.all([
        prisma.commission.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.commission.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: {
            paidAt: {
              gte: dayStart,
              lte: dayEnd
            },
            status: 'PAID'
          }
        })
      ])

      dailyStats.push({
        date: dateStr,
        commissionsCreated: dayCommissions._count || 0,
        commissionsAmount: Number(dayCommissions._sum?.amount || 0),
        commissionsPaid: dayPaid._count || 0,
        paidAmount: Number(dayPaid._sum?.amount || 0)
      })
    }

    // Get average commission by level
    const avgCommissionByLevel = await prisma.commission.groupBy({
      by: ['level'],
      _avg: { amount: true },
      orderBy: { level: 'asc' }
    })

    const stats = {
      total: {
        count: totalCommissions._count || 0,
        amount: Number(totalCommissions._sum?.amount || 0)
      },
      pending: {
        count: pendingCommissions._count || 0,
        amount: Number(pendingCommissions._sum?.amount || 0)
      },
      cancelled: {
        count: cancelledCommissions._count || 0,
        amount: Number(cancelledCommissions._sum?.amount || 0)
      },
      paid: {
        count: paidCommissions._count || 0,
        amount: Number(paidCommissions._sum?.amount || 0)
      },
      recent: {
        count: recentCommissions._count || 0,
        amount: Number(recentCommissions._sum?.amount || 0)
      },
      growth: {
        commissionsGrowth: Number(commissionsGrowth.toFixed(1)),
        amountGrowth: Number(amountGrowth.toFixed(1))
      },
      topAffiliates: topAffiliatesWithStats,
      levelDistribution: levelStats,
      avgCommissionByLevel: avgCommissionByLevel.map(level => ({
        level: level.level,
        avgAmount: Number(level._avg.amount || 0)
      })),
      dailyStats
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching commission stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
