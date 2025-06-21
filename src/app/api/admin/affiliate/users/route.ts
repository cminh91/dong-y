import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/affiliate/users - Lấy danh sách affiliate users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const level = searchParams.get('level') || 'all'

    const skip = (page - 1) * limit

    // Build where clause - Affiliate users only
    const where: any = {
      OR: [
        { role: 'COLLABORATOR' },
        { role: 'AGENT' },
        // CUSTOMER with affiliate privileges (has commission rate > 0)
        {
          AND: [
            { role: 'CUSTOMER' },
            { commissionRate: { gt: 0 } }
          ]
        }
      ]
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { phoneNumber: { contains: search } },
            { referralCode: { contains: search } }
          ]
        }
      ]
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (level !== 'all') {
      where.affiliateLevel = parseInt(level)
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          bankAccounts: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          referredUsers: {
            select: { id: true }
          },
          commissions: {
            where: { status: 'PAID' },
            select: { amount: true }
          },
          withdrawals: {
            select: { 
              amount: true,
              status: true 
            }
          },
          affiliateLinks: {
            select: { id: true }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Calculate stats for each user
    const usersWithStats = users.map(user => {
      const totalCommissionPaid = user.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
      const totalWithdrawals = user.withdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
      const pendingWithdrawals = user.withdrawals
        .filter(w => w.status === 'PENDING')
        .reduce((sum, w) => sum + Number(w.amount), 0)

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        affiliateLevel: user.affiliateLevel,
        totalSales: Number(user.totalSales),
        totalCommission: Number(user.totalCommission),
        availableBalance: Number(user.availableBalance),
        totalWithdrawn: Number(user.totalWithdrawn),
        commissionRate: Number(user.commissionRate),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          referredCount: user.referredUsers.length,
          totalCommissionPaid,
          totalWithdrawals,
          pendingWithdrawals,
          totalLinks: user.affiliateLinks.length
        },
        bankAccount: user.bankAccounts[0] || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching affiliate users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/affiliate/users - Tạo affiliate user mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      role = 'COLLABORATOR',
      affiliateLevel = 1,
      commissionRate = 0.15
    } = body

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Generate unique referral code
    let referralCode: string
    let isUnique = false
    
    while (!isUnique) {
      referralCode = `AF${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      const existing = await prisma.user.findUnique({
        where: { referralCode }
      })
      if (!existing) isUnique = true
    }

    // Hash password (you should implement proper password hashing)
    const hashedPassword = password // TODO: Implement bcrypt hashing

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        address,
        role: role.toUpperCase(),
        status: 'ACTIVE',
        referralCode: referralCode!,
        affiliateLevel,
        commissionRate,
        totalSales: 0,
        totalCommission: 0,
        availableBalance: 0,
        totalWithdrawn: 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        affiliateLevel: user.affiliateLevel,
        commissionRate: Number(user.commissionRate),
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating affiliate user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
