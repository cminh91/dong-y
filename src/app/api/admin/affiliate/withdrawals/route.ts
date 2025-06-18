import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWithdrawalAmount, getCommissionSettings } from '@/lib/affiliate-settings'

// GET /api/admin/affiliate/withdrawals - Lấy danh sách withdrawal requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { user: {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { phoneNumber: { contains: search } }
          ]
        }},
        { transactionId: { contains: search } },
        { bankAccount: {
          OR: [
            { accountNumber: { contains: search } },
            { accountName: { contains: search } }
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

    // Get withdrawals with pagination
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              totalCommission: true,
              availableBalance: true,
              totalWithdrawn: true
            }
          },
          bankAccount: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              accountName: true,
              branch: true
            }
          }
        }
      }),
      prisma.withdrawal.count({ where })
    ])

    // Format withdrawals data
    const withdrawalsWithData = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      processedAt: withdrawal.processedAt,
      adminNote: withdrawal.adminNote,
      transactionId: withdrawal.transactionId,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
      user: withdrawal.user ? {
        ...withdrawal.user,
        totalCommission: Number(withdrawal.user.totalCommission),
        availableBalance: Number(withdrawal.user.availableBalance),
        totalWithdrawn: Number(withdrawal.user.totalWithdrawn)
      } : null,
      bankAccount: withdrawal.bankAccount ? withdrawal.bankAccount : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: withdrawalsWithData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/affiliate/withdrawals - Tạo withdrawal request thủ công
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      amount,
      bankAccountId,
      adminNote
    } = body

    // Validate required fields
    if (!userId || !amount || !bankAccountId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists and has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bankAccounts: {
          where: { id: bankAccountId }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.bankAccounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bank account not found' },
        { status: 404 }
      )
    }

    if (Number(user.availableBalance) < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Create withdrawal
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          bankAccountId,
          status: 'PENDING',
          adminNote
        },
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

      // Deduct from available balance
      await tx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            decrement: amount
          }
        }
      })

      return newWithdrawal
    })

    return NextResponse.json({
      success: true,
      data: {
        id: withdrawal.id,
        amount: Number(withdrawal.amount),
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        adminNote: withdrawal.adminNote,
        user: withdrawal.user,
        bankAccount: withdrawal.bankAccount
      }
    })

  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
