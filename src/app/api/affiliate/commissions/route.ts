import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'PENDING', 'PAID', 'CANCELLED'
    const period = searchParams.get('period') || '30'; // days
    const linkId = searchParams.get('linkId');

    const skip = (page - 1) * limit;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Build where clause
    let whereClause: any = {
      userId: userPayload.userId
    };

    if (status) {
      whereClause.status = status;
    }

    if (linkId) {
      whereClause.affiliateLinkId = linkId;
    }

    // Get commissions with pagination (NEW: Include product details)
    const [commissions, totalCount, summaryStats] = await Promise.all([
      prisma.commission.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
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
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),

      // Total count for pagination
      prisma.commission.count({ where: whereClause }),

      // Summary statistics
      prisma.commission.groupBy({
        by: ['status'],
        where: {
          userId: userPayload.userId,
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      })
    ]);

    // Temporarily disable complex queries to avoid BigInt issues
    const monthlyTrends: any[] = [];
    const topLinks: any[] = [];

    // Calculate summary totals
    const summaryTotals = summaryStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = {
        amount: Number(stat._sum.amount || 0),
        count: stat._count.id
      };
      return acc;
    }, {} as any);

    // Get user's current balance info
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        totalCommission: true,
        availableBalance: true,
        totalWithdrawn: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        commissions: commissions.map(commission => ({
          id: commission.id,
          amount: Number(commission.amount),
          status: commission.status,
          commissionType: commission.commissionType,
          level: commission.level,
          orderAmount: Number(commission.orderAmount),
          commissionRate: Number(commission.commissionRate),
          productQuantity: commission.productQuantity,
          productPrice: commission.productPrice ? Number(commission.productPrice) : null,
          createdAt: commission.createdAt,
          paidAt: commission.paidAt,
          // NEW: Product details
          product: commission.product ? {
            ...commission.product,
            commissionRate: Number(commission.product.commissionRate),
            images: commission.product.images ? JSON.parse(commission.product.images as string) : []
          } : null,
          // NEW: Order item details
          orderItem: commission.orderItem ? {
            ...commission.orderItem,
            price: Number(commission.orderItem.price)
          } : null,
          // NEW: Affiliate link details
          affiliateLink: commission.affiliateLink,
          order: commission.order ? {
            ...commission.order,
            totalAmount: Number(commission.order.totalAmount)
          } : null,
          referredUser: commission.referredUser
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        summary: {
          pending: summaryTotals.pending || { amount: 0, count: 0 },
          paid: summaryTotals.paid || { amount: 0, count: 0 },
          cancelled: summaryTotals.cancelled || { amount: 0, count: 0 },
          total: {
            amount: Number(user?.totalCommission || 0),
            available: Number(user?.availableBalance || 0),
            withdrawn: Number(user?.totalWithdrawn || 0)
          }
        },
        trends: monthlyTrends,
        topLinks: topLinks
      }
    });

  } catch (error) {
    console.error('Error fetching commissions:', error);

    // Check if it's a BigInt serialization error
    if (error instanceof TypeError && error.message.includes('BigInt')) {
      console.error('BigInt serialization error - check data types');
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Request commission payout (move from pending to approved)
export async function POST(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commissionIds, note } = body;

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Commission IDs are required' },
        { status: 400 }
      );
    }

    // Verify all commissions belong to user and are pending
    const commissions = await prisma.commission.findMany({
      where: {
        id: { in: commissionIds },
        userId: userPayload.userId,
        status: 'PENDING'
      }
    });

    if (commissions.length !== commissionIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some commissions are not valid or already processed' },
        { status: 400 }
      );
    }

    const totalAmount = commissions.reduce((sum, comm) => sum + Number(comm.amount), 0);

    // Update commissions to paid status (no APPROVED status in current schema)
    await prisma.commission.updateMany({
      where: {
        id: { in: commissionIds }
      },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Update user's available balance
    await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        availableBalance: {
          increment: totalAmount
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        processedCount: commissions.length,
        totalAmount,
        message: 'Commissions marked as paid and added to available balance'
      }
    });

  } catch (error) {
    console.error('Error processing commission payout:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
