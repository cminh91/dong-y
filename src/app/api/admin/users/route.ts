import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Get admin user to verify role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        {
          fullName: {
            contains: search
            // mode: 'insensitive' not supported in MySQL/MariaDB
          }
        },
        {
          email: {
            contains: search
            // mode: 'insensitive' not supported in MySQL/MariaDB
          }
        },
        {
          phoneNumber: {
            contains: search
            // mode: 'insensitive' not supported in MySQL/MariaDB
          }
        }
      ];
    }

    // Get total count
    const totalCount = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        referralCode: true,
        affiliateLevel: true,
        totalSales: true,
        totalCommission: true,
        availableBalance: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        _count: {
          select: {
            orders: true,
            referredUsers: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform users for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      affiliateLevel: user.affiliateLevel,
      totalSales: Number(user.totalSales),
      totalCommission: Number(user.totalCommission),
      availableBalance: Number(user.availableBalance),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      ordersCount: user._count.orders,
      referralsCount: user._count.referredUsers
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách người dùng' },
      { status: 500 }
    );
  }
}
