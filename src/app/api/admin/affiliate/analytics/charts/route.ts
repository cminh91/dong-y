import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/analytics/charts - Lấy dữ liệu cho charts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days
    const chartType = searchParams.get('type') || 'daily' // daily, monthly

    const daysAgo = parseInt(timeRange)

    if (chartType === 'daily') {
      return await getDailyChartData(daysAgo)
    } else if (chartType === 'monthly') {
      return await getMonthlyChartData()
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid chart type' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getDailyChartData(daysAgo: number) {
  const dailyStats = []
  
  for (let i = daysAgo - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const [clicks, conversions, commissions] = await Promise.all([
      // Daily clicks
      prisma.affiliateClick.count({
        where: {
          clickedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      }),
      // Daily conversions
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
      }),
      // Daily commissions
      prisma.commission.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
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

    dailyStats.push({
      date: dateStr,
      clicks,
      conversions: conversions._count || 0,
      commissions: commissions._count || 0,
      revenue: Number(conversions._sum?.orderValue || 0),
      commissionsAmount: Number(commissions._sum?.amount || 0)
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      type: 'daily',
      data: dailyStats
    }
  })
}

async function getMonthlyChartData() {
  const monthlyStats = []
  
  // Get data for last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    const monthStr = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })

    const [affiliates, revenue, commissions] = await Promise.all([
      // New affiliates in month
      prisma.user.count({
        where: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ],
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      // Revenue in month
      prisma.affiliateConversion.aggregate({
        _sum: { orderValue: true },
        where: {
          convertedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      // Commissions in month
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
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

    monthlyStats.push({
      month: monthStr,
      affiliates,
      revenue: Number(revenue._sum?.orderValue || 0),
      commissions: Number(commissions._sum?.amount || 0)
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      type: 'monthly',
      data: monthlyStats
    }
  })
}
