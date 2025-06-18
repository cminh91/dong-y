import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTokenFromRequest } from '@/lib/auth';
import { convertBigIntToNumber } from '@/lib/bigint-utils';

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
    const level = searchParams.get('level'); // '1', '2', '3' for multi-level
    const period = searchParams.get('period') || '30'; // days

    const skip = (page - 1) * limit;
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get user's referral code
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        referralCode: true,
        totalCommission: true,
        affiliateLevel: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get direct referrals (Level 1)
    const [directReferrals, totalDirectReferrals] = await Promise.all([
      prisma.user.findMany({
        where: {
          referredBy: userPayload.userId
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          totalCommission: true,
          affiliateLevel: true,
          createdAt: true,
          _count: {
            select: {
              referredUsers: true, // Count of their referrals (Level 2)
              orders: {
                where: {
                  createdAt: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),

      prisma.user.count({
        where: {
          referredBy: userPayload.userId
        }
      })
    ]);

    // Get Level 2 referrals (referrals of referrals)
    const level2Referrals = await prisma.user.findMany({
      where: {
        referredBy: {
          in: directReferrals.map(ref => ref.id)
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        referredBy: true,
        totalCommission: true,
        createdAt: true
      }
    });

    // Get commissions earned from referrals
    const referralCommissions = await prisma.commission.findMany({
      where: {
        userId: userPayload.userId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
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
      take: 50
    });

    // Calculate referral statistics
    const stats = await prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT r.id) as total_referrals,
        COUNT(DISTINCT CASE WHEN r.created_at >= ${startDate} THEN r.id END) as new_referrals,
        COUNT(DISTINCT CASE WHEN r.status = 'ACTIVE' THEN r.id END) as active_referrals,
        COALESCE(SUM(CASE WHEN c.created_at >= ${startDate} THEN c.amount END), 0) as period_commission,
        COALESCE(SUM(c.amount), 0) as total_commission
      FROM users r
      LEFT JOIN commissions c ON c.referred_user_id = r.id AND c.user_id = ${userPayload.userId}
      WHERE r.referred_by = ${userPayload.userId}
    `;

    // Get monthly referral trends
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as referrals,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_referrals
      FROM users
      WHERE referred_by = ${userPayload.userId}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `;

    // Build referral tree structure
    const referralTree = directReferrals.map(ref => ({
      ...ref,
      totalCommission: Number(ref.totalCommission),
      level2Referrals: level2Referrals.filter(l2 => l2.referredBy === ref.id).map(l2 => ({
        ...l2,
        totalCommission: Number(l2.totalCommission)
      }))
    }));

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/dang-ky?ref=${user.referralCode}`;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          referralCode: user.referralCode,
          referralLink,
          totalCommission: Number(user.totalCommission),
          affiliateLevel: user.affiliateLevel
        },
        referrals: {
          direct: convertBigIntToNumber(referralTree),
          level2Count: level2Referrals.length
        },
        pagination: {
          page,
          limit,
          total: Number(totalDirectReferrals),
          pages: Math.ceil(Number(totalDirectReferrals) / limit)
        },
        statistics: {
          totalReferrals: Number((stats as any)[0]?.total_referrals || 0),
          newReferrals: Number((stats as any)[0]?.new_referrals || 0),
          activeReferrals: Number((stats as any)[0]?.active_referrals || 0),
          periodCommission: Number((stats as any)[0]?.period_commission || 0),
          totalCommission: Number((stats as any)[0]?.total_commission || 0)
        },
        recentCommissions: referralCommissions.map(comm => ({
          id: comm.id,
          amount: Number(comm.amount),
          createdAt: comm.createdAt,
          fromUser: comm.referredUser
        })),
        trends: convertBigIntToNumber(monthlyTrends)
      }
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate new referral code
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
    const { action } = body;

    if (action === 'regenerate_code') {
      // Generate new unique referral code
      let newCode;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        newCode = generateReferralCode();
        const existing = await prisma.user.findFirst({
          where: { referralCode: newCode }
        });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return NextResponse.json(
          { success: false, error: 'Unable to generate unique referral code' },
          { status: 500 }
        );
      }

      // Update user's referral code
      const updatedUser = await prisma.user.update({
        where: { id: userPayload.userId },
        data: { referralCode: newCode },
        select: { referralCode: true }
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const referralLink = `${baseUrl}/dang-ky?ref=${newCode}`;

      return NextResponse.json({
        success: true,
        data: {
          referralCode: updatedUser.referralCode,
          referralLink,
          message: 'Referral code regenerated successfully'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing referral action:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
