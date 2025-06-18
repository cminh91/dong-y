import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCommission, getCommissionSettings } from '@/lib/affiliate-settings'

// GET /api/admin/affiliate/commissions - Lấy danh sách commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId') || ''
    const level = searchParams.get('level') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { user: {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } }
          ]
        }},
        { order: { orderNumber: { contains: search } } },
        { referredUser: {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } }
          ]
        }}
      ]
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (userId) {
      where.userId = userId
    }

    if (level !== 'all') {
      where.level = parseInt(level)
    }

    // Get commissions with pagination
    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              referralCode: true,
              affiliateLevel: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              createdAt: true
            }
          },
          referredUser: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }),
      prisma.commission.count({ where })
    ])

    // Format commissions data
    const commissionsWithData = commissions.map(commission => ({
      id: commission.id,
      level: commission.level,
      orderAmount: Number(commission.orderAmount),
      commissionRate: Number(commission.commissionRate),
      amount: Number(commission.amount),
      status: commission.status,
      paidAt: commission.paidAt,
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
      user: commission.user,
      order: commission.order ? {
        ...commission.order,
        totalAmount: Number(commission.order.totalAmount)
      } : null,
      referredUser: commission.referredUser
    }))

    return NextResponse.json({
      success: true,
      data: {
        commissions: commissionsWithData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/affiliate/commissions - Tạo commission thủ công
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      orderId,
      referredUserId,
      level = 1,
      orderAmount,
      commissionRate,
      amount,
      status = 'PENDING'
    } = body

    // Validate required fields
    if (!userId || !orderId || !referredUserId || !orderAmount || !commissionRate || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if users exist
    const [user, referredUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: referredUserId } })
    ])

    if (!user || !referredUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if commission already exists for this order and user
    const existingCommission = await prisma.commission.findFirst({
      where: {
        userId,
        orderId,
        level
      }
    })

    if (existingCommission) {
      return NextResponse.json(
        { success: false, error: 'Commission already exists for this order and level' },
        { status: 400 }
      )
    }

    // Create commission
    const commission = await prisma.commission.create({
      data: {
        userId,
        orderId,
        referredUserId,
        level,
        orderAmount,
        commissionRate,
        amount,
        status: status.toUpperCase()
      },
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

    return NextResponse.json({
      success: true,
      data: {
        id: commission.id,
        level: commission.level,
        orderAmount: Number(commission.orderAmount),
        commissionRate: Number(commission.commissionRate),
        amount: Number(commission.amount),
        status: commission.status,
        createdAt: commission.createdAt,
        user: commission.user,
        order: commission.order ? {
          ...commission.order,
          totalAmount: Number(commission.order.totalAmount)
        } : null,
        referredUser: commission.referredUser
      }
    })

  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
