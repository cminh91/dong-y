import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/affiliate/commissions/bulk - Bulk operations cho commissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, commissionIds, data } = body

    if (!action || !commissionIds || !Array.isArray(commissionIds)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'approve':
      case 'pay':
        result = await bulkPayCommissions(commissionIds)
        break
      case 'reject':
        result = await bulkRejectCommissions(commissionIds)
        break
      case 'update_status':
        if (!data?.status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for update_status action' },
            { status: 400 }
          )
        }
        result = await bulkUpdateStatus(commissionIds, data.status)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error in bulk commission operation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove bulkApproveCommissions since we're combining approve and pay

async function bulkRejectCommissions(commissionIds: string[]) {
  return await prisma.$transaction(async (tx) => {
    // Update commissions to cancelled
    const updatedCommissions = await tx.commission.updateMany({
      where: {
        id: { in: commissionIds },
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED'
      }
    })

    return {
      updated: updatedCommissions.count,
      message: `${updatedCommissions.count} commissions cancelled`
    }
  })
}

async function bulkPayCommissions(commissionIds: string[]) {
  return await prisma.$transaction(async (tx) => {
    // Get pending commissions
    const commissions = await tx.commission.findMany({
      where: {
        id: { in: commissionIds },
        status: 'PENDING'
      },
      include: {
        user: true
      }
    })

    if (commissions.length === 0) {
      throw new Error('No pending commissions found')
    }

    // Update commissions to paid
    const updatedCommissions = await tx.commission.updateMany({
      where: {
        id: { in: commissions.map(c => c.id) }
      },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    })

    // Update user balances
    const userUpdates = commissions.reduce((acc: any, commission) => {
      const userId = commission.userId
      if (!acc[userId]) {
        acc[userId] = 0
      }
      acc[userId] += Number(commission.amount)
      return acc
    }, {})

    for (const [userId, amount] of Object.entries(userUpdates)) {
      await tx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            increment: amount as number
          }
        }
      })
    }

    return {
      updated: updatedCommissions.count,
      totalAmount: commissions.reduce((sum, c) => sum + Number(c.amount), 0),
      usersUpdated: Object.keys(userUpdates).length,
      message: `${updatedCommissions.count} commissions paid`
    }
  })
}

async function bulkUpdateStatus(commissionIds: string[], status: string) {
  return await prisma.$transaction(async (tx) => {
    const validStatuses = ['PENDING', 'PAID', 'CANCELLED']
    const upperStatus = status.toUpperCase()
    
    if (!validStatuses.includes(upperStatus)) {
      throw new Error('Invalid status')
    }

    // Get existing commissions
    const existingCommissions = await tx.commission.findMany({
      where: { id: { in: commissionIds } },
      include: { user: true }
    })

    // Handle balance adjustments for status changes
    for (const commission of existingCommissions) {
      const oldStatus = commission.status
      const newStatus = upperStatus
      const amount = Number(commission.amount)

      if (oldStatus === 'PAID' && newStatus !== 'PAID') {
        // Remove from balance when changing from paid
        await tx.user.update({
          where: { id: commission.userId },
          data: {
            availableBalance: {
              decrement: amount
            }
          }
        })
      } else if (oldStatus !== 'PAID' && newStatus === 'PAID') {
        // Add to balance when changing to paid
        await tx.user.update({
          where: { id: commission.userId },
          data: {
            availableBalance: {
              increment: amount
            }
          }
        })
      }
    }

    // Update commissions
    const updateData: any = { status: upperStatus }
    if (upperStatus === 'PAID') {
      updateData.paidAt = new Date()
    } else if (upperStatus === 'PENDING') {
      updateData.paidAt = null
    }

    const updatedCommissions = await tx.commission.updateMany({
      where: { id: { in: commissionIds } },
      data: updateData
    })

    return {
      updated: updatedCommissions.count,
      message: `${updatedCommissions.count} commissions updated to ${upperStatus}`
    }
  })
}
