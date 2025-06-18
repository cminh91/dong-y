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

    // Get user with affiliate data
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        referralCode: true,
        totalCommission: true,
        availableBalance: true,
        totalWithdrawn: true,
        affiliateLevel: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current month stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      totalLinks,
      activeLinks,
      totalClicks,
      totalConversions,
      monthlyClicks,
      monthlyConversions,
      monthlyCommission,
      recentClicks,
      topPerformingLinks
    ] = await Promise.all([
      // Total affiliate links
      prisma.affiliateLink.count({
        where: { userId: user.id }
      }),

      // Active affiliate links
      prisma.affiliateLink.count({
        where: { 
          userId: user.id,
          status: 'ACTIVE'
        }
      }),

      // Total clicks all time
      prisma.affiliateClick.count({
        where: {
          affiliateLink: {
            userId: user.id
          }
        }
      }),

      // Total conversions all time
      prisma.affiliateConversion.count({
        where: {
          affiliateLink: {
            userId: user.id
          }
        }
      }),

      // Monthly clicks
      prisma.affiliateClick.count({
        where: {
          affiliateLink: {
            userId: user.id
          },
          clickedAt: {
            gte: currentMonth
          }
        }
      }),

      // Monthly conversions
      prisma.affiliateConversion.count({
        where: {
          affiliateLink: {
            userId: user.id
          },
          convertedAt: {
            gte: currentMonth
          }
        }
      }),

      // Monthly commission
      prisma.affiliateConversion.aggregate({
        where: {
          affiliateLink: {
            userId: user.id
          },
          convertedAt: {
            gte: currentMonth
          }
        },
        _sum: {
          commissionAmount: true
        }
      }),

      // Recent clicks (last 10)
      prisma.affiliateClick.findMany({
        where: {
          affiliateLink: {
            userId: user.id
          }
        },
        include: {
          affiliateLink: {
            select: {
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          clickedAt: 'desc'
        },
        take: 10
      }),

      // Top performing links
      prisma.affiliateLink.findMany({
        where: { userId: user.id },
        orderBy: [
          { totalClicks: 'desc' },
          { totalConversions: 'desc' }
        ],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          totalClicks: true,
          totalConversions: true,
          totalCommission: true
        }
      })
    ]);

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;
    const monthlyConversionRate = monthlyClicks > 0 ? (monthlyConversions / monthlyClicks * 100) : 0;

    // Get daily stats for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(ac.clicked_at) as date,
        COUNT(ac.id) as clicks,
        COUNT(acv.id) as conversions,
        COALESCE(SUM(acv.commission_amount), 0) as commission
      FROM affiliate_clicks ac
      LEFT JOIN affiliate_conversions acv ON DATE(ac.clicked_at) = DATE(acv.converted_at)
        AND ac.affiliate_link_id = acv.affiliate_link_id
      INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
      WHERE al.user_id = ${user.id}
        AND ac.clicked_at >= ${thirtyDaysAgo}
      GROUP BY DATE(ac.clicked_at)
      ORDER BY date DESC
      LIMIT 30
    `;



    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          totalCommission: Number(user.totalCommission),
          availableBalance: Number(user.availableBalance),
          totalWithdrawn: Number(user.totalWithdrawn)
        },
        stats: {
          totalLinks: Number(totalLinks),
          activeLinks: Number(activeLinks),
          totalClicks: Number(totalClicks),
          totalConversions: Number(totalConversions),
          conversionRate: Number(conversionRate.toFixed(2)),
          monthlyClicks: Number(monthlyClicks),
          monthlyConversions: Number(monthlyConversions),
          monthlyCommission: Number(monthlyCommission._sum.commissionAmount || 0),
          monthlyConversionRate: Number(monthlyConversionRate.toFixed(2))
        },
        recentActivity: convertBigIntToNumber(recentClicks),
        topPerformingLinks: convertBigIntToNumber(topPerformingLinks),
        chartData: convertBigIntToNumber(dailyStats)
      }
    });

  } catch (error) {
    console.error('Error fetching affiliate dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
