import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/users/stats - Lấy thống kê tổng quan affiliate users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    const daysAgo = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get total affiliate users
    const totalAffiliates = await prisma.user.count({
      where: {
        OR: [
          { role: 'COLLABORATOR' },
          { role: 'AGENT' },
          { referralCode: { not: null } }
        ]
      }
    })

    // Get active affiliates (users with activity in the time range)
    const activeAffiliates = await prisma.user.count({
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
    })

    // Get new affiliates in time range
    const newAffiliates = await prisma.user.count({
      where: {
        OR: [
          { role: 'COLLABORATOR' },
          { role: 'AGENT' },
          { referralCode: { not: null } }
        ],
        createdAt: { gte: startDate }
      }
    })

    // Get total commissions
    const totalCommissionsResult = await prisma.commission.aggregate({
      _sum: { amount: true },
      _count: { id: true },
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

    // Get pending commissions
    const pendingCommissionsResult = await prisma.commission.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        status: 'PENDING',
        user: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ]
        }
      }
    })

    // Get total withdrawals
    const totalWithdrawalsResult = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      _count: { id: true },
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

    // Get pending withdrawals
    const pendingWithdrawalsResult = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        status: 'PENDING',
        user: {
          OR: [
            { role: 'COLLABORATOR' },
            { role: 'AGENT' },
            { referralCode: { not: null } }
          ]
        }
      }
    })

    // Get growth data for previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const previousNewAffiliates = await prisma.user.count({
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
    })

    const previousCommissions = await prisma.commission.aggregate({
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
    const affiliatesGrowth = previousNewAffiliates > 0 
      ? ((newAffiliates - previousNewAffiliates) / previousNewAffiliates) * 100 
      : newAffiliates > 0 ? 100 : 0

    const commissionsGrowth = Number(previousCommissions._sum?.amount || 0) > 0
      ? ((Number(currentCommissions._sum?.amount || 0) - Number(previousCommissions._sum?.amount || 0)) / Number(previousCommissions._sum?.amount || 0)) * 100
      : Number(currentCommissions._sum?.amount || 0) > 0 ? 100 : 0

    // Get top performers
    const topPerformers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'COLLABORATOR' },
          { role: 'AGENT' },
          { referralCode: { not: null } }
        ],
        status: 'ACTIVE'
      },
      orderBy: { totalCommission: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        totalCommission: true,
        totalSales: true,
        referredUsers: {
          select: { id: true }
        },
        commissions: {
          where: { status: 'PAID' },
          select: { amount: true }
        }
      }
    })

    const stats = {
      totalAffiliates,
      activeAffiliates,
      newAffiliates,
      totalCommissions: Number(totalCommissionsResult._sum?.amount || 0),
      totalCommissionsCount: totalCommissionsResult._count || 0,
      pendingCommissions: Number(pendingCommissionsResult._sum?.amount || 0),
      pendingCommissionsCount: pendingCommissionsResult._count || 0,
      totalWithdrawals: Number(totalWithdrawalsResult._sum?.amount || 0),
      totalWithdrawalsCount: totalWithdrawalsResult._count || 0,
      pendingWithdrawals: Number(pendingWithdrawalsResult._sum?.amount || 0),
      pendingWithdrawalsCount: pendingWithdrawalsResult._count || 0,
      growth: {
        affiliatesGrowth: Number(affiliatesGrowth.toFixed(1)),
        commissionsGrowth: Number(commissionsGrowth.toFixed(1))
      },
      topPerformers: topPerformers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        totalCommission: Number(user.totalCommission),
        totalSales: Number(user.totalSales),
        referredCount: user.referredUsers.length,
        paidCommissions: user.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching affiliate users stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
