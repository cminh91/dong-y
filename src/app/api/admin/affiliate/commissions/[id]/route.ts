import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/commissions/[id] - Lấy thông tin chi tiết commission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            referralCode: true,
            affiliateLevel: true,
            totalCommission: true,
            availableBalance: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                    price: true
                  }
                }
              }
            }
          }
        },
        referredUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            createdAt: true
          }
        }
      }
    })

    if (!commission) {
      return NextResponse.json(
        { success: false, error: 'Commission not found' },
        { status: 404 }
      )
    }

    const commissionWithData = {
      ...commission,
      orderAmount: Number(commission.orderAmount),
      commissionRate: Number(commission.commissionRate),
      amount: Number(commission.amount),
      user: commission.user ? {
        ...commission.user,
        totalCommission: Number(commission.user.totalCommission),
        availableBalance: Number(commission.user.availableBalance)
      } : null,
      order: commission.order ? {
        ...commission.order,
        totalAmount: Number(commission.order.totalAmount),
        orderItems: commission.order.orderItems.map(item => ({
          ...item,
          price: Number(item.price),
          product: item.product ? {
            ...item.product,
            price: Number(item.product.price)
          } : null
        }))
      } : null
    }

    return NextResponse.json({
      success: true,
      data: commissionWithData
    })

  } catch (error) {
    console.error('Error fetching commission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/affiliate/commissions/[id] - Cập nhật commission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      status,
      amount,
      commissionRate,
      adminNote
    } = body

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingCommission) {
      return NextResponse.json(
        { success: false, error: 'Commission not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status = status.toUpperCase()
      
      // If marking as paid, set paidAt timestamp
      if (status.toUpperCase() === 'PAID') {
        updateData.paidAt = new Date()
      } else if (status.toUpperCase() === 'PENDING') {
        updateData.paidAt = null
      }
    }
    
    if (amount !== undefined) updateData.amount = amount
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate

    // Start transaction for commission update and user balance update
    const result = await prisma.$transaction(async (tx) => {
      // Update commission
      const updatedCommission = await tx.commission.update({
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
          order: {
            select: {
              orderNumber: true,
              totalAmount: true
            }
          },
          referredUser: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      })

      // Update user balance if status changed
      if (status !== undefined && existingCommission.user) {
        const oldAmount = Number(existingCommission.amount)
        const newAmount = Number(amount || existingCommission.amount)
        
        if (status.toUpperCase() === 'PAID' && existingCommission.status !== 'PAID') {
          // Add to available balance when marking as paid
          await tx.user.update({
            where: { id: existingCommission.userId },
            data: {
              availableBalance: {
                increment: newAmount
              }
            }
          })
        } else if (status.toUpperCase() !== 'PAID' && existingCommission.status === 'PAID') {
          // Subtract from available balance when changing from paid
          await tx.user.update({
            where: { id: existingCommission.userId },
            data: {
              availableBalance: {
                decrement: oldAmount
              }
            }
          })
        } else if (status.toUpperCase() === 'PAID' && existingCommission.status === 'PAID' && amount !== undefined) {
          // Adjust balance if amount changed for already paid commission
          const difference = newAmount - oldAmount
          await tx.user.update({
            where: { id: existingCommission.userId },
            data: {
              availableBalance: {
                increment: difference
              }
            }
          })
        }
      }

      return updatedCommission
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        level: result.level,
        orderAmount: Number(result.orderAmount),
        commissionRate: Number(result.commissionRate),
        amount: Number(result.amount),
        status: result.status,
        paidAt: result.paidAt,
        updatedAt: result.updatedAt,
        user: result.user,
        order: result.order ? {
          ...result.order,
          totalAmount: Number(result.order.totalAmount)
        } : null,
        referredUser: result.referredUser
      }
    })

  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/affiliate/commissions/[id] - Xóa commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!existingCommission) {
      return NextResponse.json(
        { success: false, error: 'Commission not found' },
        { status: 404 }
      )
    }

    // Check if commission is already paid
    if (existingCommission.status === 'PAID') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete paid commission. Please adjust user balance manually if needed.' 
        },
        { status: 400 }
      )
    }

    // Delete the commission
    await prisma.commission.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Commission deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting commission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
