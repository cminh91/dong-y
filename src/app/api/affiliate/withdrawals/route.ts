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
    const status = searchParams.get('status'); // 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'

    const skip = (page - 1) * limit;

    // Build where clause
    let whereClause: any = {
      userId: userPayload.userId
    };

    if (status) {
      whereClause.status = status;
    }

    // Get withdrawals with pagination
    const [withdrawals, totalCount, user] = await Promise.all([
      prisma.withdrawal.findMany({
        where: whereClause,
        include: {
          bankAccount: {
            select: {
              bankName: true,
              accountNumber: true,
              accountName: true
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
      prisma.withdrawal.count({ where: whereClause }),

      // User balance info
      prisma.user.findUnique({
        where: { id: userPayload.userId },
        select: {
          availableBalance: true,
          totalWithdrawn: true,
          totalCommission: true
        }
      })
    ]);

    // Get withdrawal settings for fee calculation
    const { getCommissionSettings } = await import('@/lib/affiliate-settings');
    const commissionSettings = await getCommissionSettings();
    const withdrawalFee = commissionSettings.withdrawalFee || 5000;
    const feeRate = 0.02; // 2% backup rate

    // Get withdrawal statistics
    const stats = await prisma.withdrawal.groupBy({
      by: ['status'],
      where: {
        userId: userPayload.userId
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get monthly withdrawal trends
    const monthlyTrendsRaw = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        status,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM withdrawals
      WHERE user_id = ${userPayload.userId}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), status
      ORDER BY month DESC
    `;

    // Convert BigInt to Number for JSON serialization
    const monthlyTrends = (monthlyTrendsRaw as any[]).map(trend => ({
      month: trend.month,
      status: trend.status,
      total_amount: Number(trend.total_amount),
      count: Number(trend.count)
    }));

    // Calculate summary
    const summary = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = {
        amount: Number(stat._sum.amount || 0),
        count: stat._count.id
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: withdrawals.map(withdrawal => {
          const amount = Number(withdrawal.amount);
          const calculatedFee = Math.max(amount * feeRate, withdrawalFee);
          const netAmount = amount - calculatedFee;

          return {
            id: withdrawal.id,
            amount,
            fee: calculatedFee,
            netAmount,
            status: withdrawal.status,
            note: withdrawal.adminNote,
            requestedAt: withdrawal.requestedAt,
            approvedAt: withdrawal.status === 'COMPLETED' ? withdrawal.processedAt : null,
            completedAt: withdrawal.processedAt,
            rejectedAt: withdrawal.status === 'REJECTED' ? withdrawal.processedAt : null,
            cancelledAt: null, // No cancelled status in current schema
            bankAccount: {
              bankName: withdrawal.bankAccount.bankName,
              accountNumber: withdrawal.bankAccount.accountNumber,
              accountHolder: withdrawal.bankAccount.accountName
            }
          };
        }),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        balance: {
          available: Number(user?.availableBalance || 0),
          totalWithdrawn: Number(user?.totalWithdrawn || 0),
          totalCommission: Number(user?.totalCommission || 0)
        },
        summary: {
          pending: summary.pending || { amount: 0, count: 0 },
          approved: summary.approved || { amount: 0, count: 0 },
          completed: summary.completed || { amount: 0, count: 0 },
          rejected: summary.rejected || { amount: 0, count: 0 }
        },
        trends: monthlyTrends
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create withdrawal request
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
    const { amount, bankAccountId, note } = body;

    // DEBUG: Log request data
    console.log('=== WITHDRAWAL REQUEST DEBUG ===');
    console.log('User ID:', userPayload.userId);
    console.log('Amount:', amount);
    console.log('Bank Account ID:', bankAccountId);
    console.log('Note:', note);

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid withdrawal amount' },
        { status: 400 }
      );
    }

    if (!bankAccountId) {
      return NextResponse.json(
        { success: false, error: 'Bank account is required' },
        { status: 400 }
      );
    }

    // Get user and verify bank account
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        availableBalance: true,
        fullName: true,
        bankAccounts: {
          where: { id: bankAccountId },
          select: { id: true, bankName: true, accountNumber: true, accountName: true }
        }
      }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Available balance:', Number(user.availableBalance));
      console.log('Bank accounts found:', user.bankAccounts.length);
      console.log('Bank accounts:', user.bankAccounts);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.bankAccounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bank account not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Bank account exists, proceed with withdrawal

    const availableBalance = Number(user.availableBalance);
    const withdrawalAmount = Number(amount);

    // Get withdrawal settings from database
    const { getCommissionSettings } = await import('@/lib/affiliate-settings');
    const commissionSettings = await getCommissionSettings();

    // Check minimum withdrawal amount
    const minWithdrawal = commissionSettings.minWithdrawal || 100000;
    if (withdrawalAmount < minWithdrawal) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal amount is ${minWithdrawal.toLocaleString('vi-VN')}đ` },
        { status: 400 }
      );
    }

    if (withdrawalAmount > availableBalance) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate withdrawal fee using settings
    const withdrawalFee = commissionSettings.withdrawalFee || 5000;
    const feeRate = 0.02; // 2% backup rate
    const calculatedFee = Math.max(withdrawalAmount * feeRate, withdrawalFee);
    const netAmount = withdrawalAmount - calculatedFee;

    // Check if there's any pending withdrawal
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: userPayload.userId,
        status: 'PENDING'
      }
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'You have a pending withdrawal request. Please wait for it to be processed.' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: userPayload.userId,
        amount: withdrawalAmount,
        bankAccountId,
        userNote: note || null,
        status: 'PENDING'
      },
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
            accountName: true
          }
        }
      }
    });

    // Deduct from available balance (reserve the amount)
    await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        availableBalance: {
          decrement: withdrawalAmount
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        withdrawal: {
          id: withdrawal.id,
          amount: Number(withdrawal.amount),
          fee: calculatedFee,
          netAmount,
          status: withdrawal.status,
          note: withdrawal.userNote,
          requestedAt: withdrawal.requestedAt,
          bankAccount: {
            bankName: withdrawal.bankAccount.bankName,
            accountNumber: withdrawal.bankAccount.accountNumber,
            accountHolder: withdrawal.bankAccount.accountName
          }
        },
        message: 'Withdrawal request created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel withdrawal request (only for PENDING status)
export async function DELETE(request: NextRequest) {
  try {
    const userPayload = await verifyTokenFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const withdrawalId = searchParams.get('id');

    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal ID is required' },
        { status: 400 }
      );
    }

    // Find withdrawal
    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        id: withdrawalId,
        userId: userPayload.userId,
        status: 'PENDING'
      }
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    // Cancel withdrawal and refund balance
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          adminNote: 'Cancelled by user'
        }
      }),
      prisma.user.update({
        where: { id: userPayload.userId },
        data: {
          availableBalance: {
            increment: Number(withdrawal.amount)
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Withdrawal cancelled successfully'
      }
    });

  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
