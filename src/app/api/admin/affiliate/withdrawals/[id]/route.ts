import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/withdrawals/[id] - Lấy thông tin chi tiết withdrawal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            address: true,
            totalCommission: true,
            availableBalance: true,
            totalWithdrawn: true,
            referralCode: true,
            affiliateLevel: true
          }
        },
        bankAccount: {
          select: {
            id: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            branch: true,
            isPrimary: true
          }
        }
      }
    })

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    // Get user's withdrawal history
    const withdrawalHistory = await prisma.withdrawal.findMany({
      where: { 
        userId: withdrawal.userId,
        id: { not: withdrawal.id }
      },
      orderBy: { requestedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        status: true,
        requestedAt: true,
        processedAt: true
      }
    })

    const withdrawalWithData = {
      ...withdrawal,
      amount: Number(withdrawal.amount),
      user: withdrawal.user ? {
        ...withdrawal.user,
        totalCommission: Number(withdrawal.user.totalCommission),
        availableBalance: Number(withdrawal.user.availableBalance),
        totalWithdrawn: Number(withdrawal.user.totalWithdrawn)
      } : null,
      history: withdrawalHistory.map(w => ({
        ...w,
        amount: Number(w.amount)
      }))
    }

    return NextResponse.json({
      success: true,
      data: withdrawalWithData
    })

  } catch (error) {
    console.error('Error fetching withdrawal:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/affiliate/withdrawals/[id] - Cập nhật withdrawal (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      status,
      adminNote,
      transactionId
    } = body

    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    // Check if withdrawal is still pending
    if (existingWithdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Withdrawal has already been processed' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PROCESSING', 'REJECTED', 'COMPLETED']
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Process withdrawal update
    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        processedAt: new Date()
      }

      if (status) updateData.status = status.toUpperCase()
      if (adminNote !== undefined) updateData.adminNote = adminNote
      if (transactionId !== undefined) updateData.transactionId = transactionId

      // Update withdrawal
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true
            }
          },
          bankAccount: {
            select: {
              bankName: true,
              accountNumber: true,
              accountName: true,
              branch: true
            }
          }
        }
      })

      // Handle status-specific logic
      if (status) {
        const statusUpper = status.toUpperCase()
        const amount = Number(existingWithdrawal.amount)

        if (statusUpper === 'REJECTED') {
          // Return money to available balance
          await tx.user.update({
            where: { id: existingWithdrawal.userId },
            data: {
              availableBalance: {
                increment: amount
              }
            }
          })
        } else if (statusUpper === 'COMPLETED') {
          // Add to total withdrawn
          await tx.user.update({
            where: { id: existingWithdrawal.userId },
            data: {
              totalWithdrawn: {
                increment: amount
              }
            }
          })
        }
      }

      return updatedWithdrawal
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        amount: Number(result.amount),
        status: result.status,
        requestedAt: result.requestedAt,
        processedAt: result.processedAt,
        adminNote: result.adminNote,
        transactionId: result.transactionId,
        updatedAt: result.updatedAt,
        user: result.user,
        bankAccount: result.bankAccount
      }
    })

  } catch (error) {
    console.error('Error updating withdrawal:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/affiliate/withdrawals/[id] - Xóa withdrawal (chỉ khi pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    // Check if withdrawal is pending
    if (existingWithdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete processed withdrawal' 
        },
        { status: 400 }
      )
    }

    // Delete withdrawal and return money to balance
    await prisma.$transaction(async (tx) => {
      // Return money to available balance
      await tx.user.update({
        where: { id: existingWithdrawal.userId },
        data: {
          availableBalance: {
            increment: Number(existingWithdrawal.amount)
          }
        }
      })

      // Delete withdrawal
      await tx.withdrawal.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Withdrawal deleted and amount returned to user balance'
    })

  } catch (error) {
    console.error('Error deleting withdrawal:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
