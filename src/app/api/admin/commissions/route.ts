import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCommissionSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED'])
});

// GET /api/admin/commissions - Get all commissions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const commissionType = searchParams.get('commissionType');
    const level = searchParams.get('level');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (productId) where.productId = productId;
    if (commissionType) where.commissionType = commissionType;
    if (level) where.level = parseInt(level);

    // Get commissions with relations
    const commissions = await prisma.commission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            affiliateLevel: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            commissionRate: true
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
        orderItem: {
          select: {
            id: true,
            quantity: true,
            price: true
          }
        },
        affiliateLink: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        referredUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count
    const total = await prisma.commission.count({ where });

    // Calculate summary stats
    const stats = await prisma.commission.aggregate({
      where,
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    // Get stats by status
    const statusStats = await prisma.commission.groupBy({
      by: ['status'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        commissions: commissions.map(commission => ({
          ...commission,
          amount: Number(commission.amount),
          orderAmount: Number(commission.orderAmount),
          commissionRate: Number(commission.commissionRate),
          productPrice: commission.productPrice ? Number(commission.productPrice) : null,
          product: commission.product ? {
            ...commission.product,
            commissionRate: Number(commission.product.commissionRate)
          } : null,
          order: commission.order ? {
            ...commission.order,
            totalAmount: Number(commission.order.totalAmount)
          } : null,
          orderItem: commission.orderItem ? {
            ...commission.orderItem,
            price: Number(commission.orderItem.price)
          } : null
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalAmount: Number(stats._sum.amount || 0),
          totalCount: stats._count._all,
          byStatus: statusStats.map(stat => ({
            status: stat.status,
            amount: Number(stat._sum.amount || 0),
            count: stat._count._all
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/commissions - Bulk update commission status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { commissionIds, status } = z.object({
      commissionIds: z.array(z.string()),
      status: z.enum(['PENDING', 'PAID', 'CANCELLED'])
    }).parse(body);

    // Update commissions
    const result = await prisma.commission.updateMany({
      where: {
        id: { in: commissionIds }
      },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null
      }
    });

    // If marking as PAID, update user available balance
    if (status === 'PAID') {
      const commissions = await prisma.commission.findMany({
        where: { id: { in: commissionIds } },
        select: { userId: true, amount: true }
      });

      // Group by user and sum amounts
      const userAmounts = commissions.reduce((acc, comm) => {
        acc[comm.userId] = (acc[comm.userId] || 0) + Number(comm.amount);
        return acc;
      }, {} as Record<string, number>);

      // Update user balances
      for (const [userId, amount] of Object.entries(userAmounts)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            availableBalance: { increment: amount }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} commissions to ${status}`,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error updating commissions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update commissions' },
      { status: 500 }
    );
  }
}
