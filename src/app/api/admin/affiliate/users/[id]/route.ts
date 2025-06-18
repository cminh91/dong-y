import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/users/[id] - Lấy thông tin chi tiết affiliate user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bankAccounts: true,
        idCards: true,
        referredByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true
          }
        },
        referredUsers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            totalSales: true
          }
        },
        commissions: {
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        withdrawals: {
          include: {
            bankAccount: {
              select: {
                bankName: true,
                accountNumber: true,
                accountName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        affiliateLinks: {
          include: {
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
                id: true,
                orderValue: true,
                commissionAmount: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate additional stats
    const totalCommissionPaid = user.commissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0)

    const totalClicks = user.affiliateLinks.reduce((sum, link) => sum + link.clicks.length, 0)
    const totalConversions = user.affiliateLinks.reduce((sum, link) => sum + link.conversions.length, 0)
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    const userWithStats = {
      ...user,
      totalSales: Number(user.totalSales),
      totalCommission: Number(user.totalCommission),
      availableBalance: Number(user.availableBalance),
      totalWithdrawn: Number(user.totalWithdrawn),
      commissionRate: Number(user.commissionRate),
      stats: {
        referredCount: user.referredUsers.length,
        totalCommissionPaid,
        totalLinks: user.affiliateLinks.length,
        totalClicks,
        totalConversions,
        conversionRate: Number(conversionRate.toFixed(2))
      },
      commissions: user.commissions.map(c => ({
        ...c,
        amount: Number(c.amount),
        orderAmount: Number(c.orderAmount),
        commissionRate: Number(c.commissionRate)
      })),
      withdrawals: user.withdrawals.map(w => ({
        ...w,
        amount: Number(w.amount)
      }))
    }

    return NextResponse.json({
      success: true,
      data: userWithStats
    })

  } catch (error) {
    console.error('Error fetching affiliate user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/affiliate/users/[id] - Cập nhật affiliate user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      fullName,
      phoneNumber,
      address,
      status,
      role,
      affiliateLevel,
      commissionRate,
      availableBalance
    } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (fullName !== undefined) updateData.fullName = fullName
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (address !== undefined) updateData.address = address
    if (status !== undefined) updateData.status = status.toUpperCase()
    if (role !== undefined) updateData.role = role.toUpperCase()
    if (affiliateLevel !== undefined) updateData.affiliateLevel = affiliateLevel
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (availableBalance !== undefined) updateData.availableBalance = availableBalance

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        status: updatedUser.status,
        role: updatedUser.role,
        affiliateLevel: updatedUser.affiliateLevel,
        commissionRate: Number(updatedUser.commissionRate),
        availableBalance: Number(updatedUser.availableBalance),
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating affiliate user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/affiliate/users/[id] - Xóa affiliate user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        commissions: true,
        withdrawals: true,
        affiliateLinks: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has pending transactions
    const hasPendingWithdrawals = existingUser.withdrawals.some(w => w.status === 'PENDING')
    const hasPendingCommissions = existingUser.commissions.some(c => c.status === 'PENDING')

    if (hasPendingWithdrawals || hasPendingCommissions) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete user with pending transactions. Please resolve all pending withdrawals and commissions first.' 
        },
        { status: 400 }
      )
    }

    // Soft delete by setting status to INACTIVE instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { 
        status: 'INACTIVE',
        email: `deleted_${Date.now()}_${existingUser.email}` // Prevent email conflicts
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('Error deleting affiliate user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
