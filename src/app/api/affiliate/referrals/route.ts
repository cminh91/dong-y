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
          affiliateLevel: true,
          createdAt: true,
          _count: {
            select: {
              referredUsers: true,
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

    // Simplified statistics - no commission data
    const totalReferrals = await prisma.user.count({
      where: { referredBy: userPayload.userId }
    });

    const newReferrals = await prisma.user.count({
      where: {
        referredBy: userPayload.userId,
        createdAt: { gte: startDate }
      }
    });

    const activeReferrals = await prisma.user.count({
      where: {
        referredBy: userPayload.userId,
        status: 'ACTIVE'
      }
    });

    // Build simplified referral structure
    const referralTree = directReferrals.map(ref => ({
      ...ref
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
          affiliateLevel: user.affiliateLevel
        },
        referrals: {
          direct: convertBigIntToNumber(referralTree)
        },
        pagination: {
          page,
          limit,
          total: Number(totalDirectReferrals),
          pages: Math.ceil(Number(totalDirectReferrals) / limit)
        },
        statistics: {
          totalReferrals: Number(totalReferrals),
          newReferrals: Number(newReferrals),
          activeReferrals: Number(activeReferrals)
        }
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


