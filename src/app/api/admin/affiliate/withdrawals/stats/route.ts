import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/withdrawals/stats - Lấy thống kê tổng quan withdrawals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30' // days

    const daysAgo = parseInt(timeRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get total withdrawals by status
    const [totalWithdrawals, pendingWithdrawals, processingWithdrawals, completedWithdrawals, rejectedWithdrawals] = await Promise.all([
      prisma.withdrawal.aggregate({
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.withdrawal.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.withdrawal.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PROCESSING' }
      }),
      prisma.withdrawal.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.withdrawal.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'REJECTED' }
      })
    ])

    // Get withdrawals in time range
    const recentWithdrawals = await prisma.withdrawal.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: {
        requestedAt: { gte: startDate }
      }
    })

    // Get growth data for previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)

    const previousWithdrawals = await prisma.withdrawal.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: {
        requestedAt: { 
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    // Calculate growth rates
    const withdrawalsGrowth = (previousWithdrawals._count || 0) > 0
      ? (((recentWithdrawals._count || 0) - (previousWithdrawals._count || 0)) / (previousWithdrawals._count || 0)) * 100
      : (recentWithdrawals._count || 0) > 0 ? 100 : 0

    const amountGrowth = Number(previousWithdrawals._sum?.amount || 0) > 0
      ? ((Number(recentWithdrawals._sum?.amount || 0) - Number(previousWithdrawals._sum?.amount || 0)) / Number(previousWithdrawals._sum?.amount || 0)) * 100
      : Number(recentWithdrawals._sum?.amount || 0) > 0 ? 100 : 0

    // Get top withdrawing users
    const topWithdrawers = await prisma.user.findMany({
      where: {
        withdrawals: {
          some: {
            status: { in: ['COMPLETED', 'PROCESSING'] }
          }
        }
      },
      include: {
        withdrawals: {
          where: { status: { in: ['COMPLETED', 'PROCESSING'] } },
          select: { amount: true }
        }
      },
      orderBy: {
        totalWithdrawn: 'desc'
      },
      take: 10
    })

    const topWithdrawersWithStats = topWithdrawers.map(user => {
      const totalWithdrawn = user.withdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        totalWithdrawn: Number(user.totalWithdrawn),
        recentWithdrawals: totalWithdrawn,
        withdrawalsCount: user.withdrawals.length,
        availableBalance: Number(user.availableBalance)
      }
    })

    // Get withdrawal distribution by bank
    const bankDistribution = await prisma.withdrawal.groupBy({
      by: ['bankAccountId'],
      _count: { id: true },
      _sum: { amount: true },
      where: { status: { in: ['COMPLETED', 'PROCESSING'] } },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    })

    // Get bank details for distribution
    const bankIds = bankDistribution.map(b => b.bankAccountId)
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { id: { in: bankIds } },
      select: {
        id: true,
        bankName: true,
        accountName: true
      }
    })

    const bankStats = bankDistribution.map(bank => {
      const bankAccount = bankAccounts.find(b => b.id === bank.bankAccountId)
      return {
        bankAccountId: bank.bankAccountId,
        bankName: bankAccount?.bankName || 'Unknown',
        accountName: bankAccount?.accountName || 'Unknown',
        count: bank._count.id,
        totalAmount: Number(bank._sum.amount || 0)
      }
    })

    // Get daily withdrawal data for charts
    const dailyStats = []
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const [dayRequested, dayProcessed] = await Promise.all([
        prisma.withdrawal.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: {
            requestedAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.withdrawal.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: {
            processedAt: {
              gte: dayStart,
              lte: dayEnd
            },
            status: { in: ['COMPLETED', 'PROCESSING'] }
          }
        })
      ])

      dailyStats.push({
        date: dateStr,
        requested: dayRequested._count || 0,
        requestedAmount: Number(dayRequested._sum?.amount || 0),
        processed: dayProcessed._count || 0,
        processedAmount: Number(dayProcessed._sum?.amount || 0)
      })
    }

    // Calculate average processing time
    const processedWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: { in: ['COMPLETED', 'PROCESSING', 'REJECTED'] },
        processedAt: { not: null }
      },
      select: {
        requestedAt: true,
        processedAt: true
      },
      take: 100 // Last 100 processed withdrawals
    })

    const avgProcessingTime = processedWithdrawals.length > 0
      ? processedWithdrawals.reduce((sum, w) => {
          const processingTime = new Date(w.processedAt!).getTime() - new Date(w.requestedAt).getTime()
          return sum + processingTime
        }, 0) / processedWithdrawals.length / (1000 * 60 * 60) // Convert to hours
      : 0

    const stats = {
      total: {
        count: totalWithdrawals._count || 0,
        amount: Number(totalWithdrawals._sum?.amount || 0)
      },
      pending: {
        count: pendingWithdrawals._count || 0,
        amount: Number(pendingWithdrawals._sum?.amount || 0)
      },
      processing: {
        count: processingWithdrawals._count || 0,
        amount: Number(processingWithdrawals._sum?.amount || 0)
      },
      completed: {
        count: completedWithdrawals._count || 0,
        amount: Number(completedWithdrawals._sum?.amount || 0)
      },
      rejected: {
        count: rejectedWithdrawals._count || 0,
        amount: Number(rejectedWithdrawals._sum?.amount || 0)
      },
      recent: {
        count: recentWithdrawals._count || 0,
        amount: Number(recentWithdrawals._sum?.amount || 0)
      },
      growth: {
        withdrawalsGrowth: Number(withdrawalsGrowth.toFixed(1)),
        amountGrowth: Number(amountGrowth.toFixed(1))
      },
      topWithdrawers: topWithdrawersWithStats,
      bankDistribution: bankStats,
      avgProcessingTime: Number(avgProcessingTime.toFixed(1)),
      dailyStats
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching withdrawal stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
