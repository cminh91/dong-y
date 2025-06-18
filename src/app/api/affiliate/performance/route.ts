import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
    const period = searchParams.get('period') || '30'; // days
    const linkId = searchParams.get('linkId'); // specific link analysis

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    let whereClause: any = {
      affiliateLink: {
        userId: userPayload.userId
      }
    };

    if (linkId) {
      whereClause.affiliateLinkId = linkId;
    }

    // Get performance data
    const [
      clicksData,
      conversionsData,
      topCountries,
      topDevices,
      hourlyStats,
      linkPerformance
    ] = await Promise.all([
      // Daily clicks data
      linkId ?
        prisma.$queryRaw`
          SELECT
            DATE(clicked_at) as date,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
            AND ac.affiliate_link_id = ${linkId}
          GROUP BY DATE(clicked_at)
          ORDER BY date ASC
        ` :
        prisma.$queryRaw`
          SELECT
            DATE(clicked_at) as date,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
          GROUP BY DATE(clicked_at)
          ORDER BY date ASC
        `,

      // Daily conversions data
      linkId ?
        prisma.$queryRaw`
          SELECT
            DATE(converted_at) as date,
            COUNT(*) as conversions,
            SUM(commission_amount) as commission
          FROM affiliate_conversions acv
          INNER JOIN affiliate_links al ON acv.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND acv.converted_at >= ${startDate}
            AND acv.affiliate_link_id = ${linkId}
          GROUP BY DATE(converted_at)
          ORDER BY date ASC
        ` :
        prisma.$queryRaw`
          SELECT
            DATE(converted_at) as date,
            COUNT(*) as conversions,
            SUM(commission_amount) as commission
          FROM affiliate_conversions acv
          INNER JOIN affiliate_links al ON acv.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND acv.converted_at >= ${startDate}
          GROUP BY DATE(converted_at)
          ORDER BY date ASC
        `,

      // Top countries by clicks
      linkId ?
        prisma.$queryRaw`
          SELECT
            SUBSTRING_INDEX(ip_address, '.', 2) as country_code,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
            AND ac.affiliate_link_id = ${linkId}
          GROUP BY country_code
          ORDER BY clicks DESC
          LIMIT 10
        ` :
        prisma.$queryRaw`
          SELECT
            SUBSTRING_INDEX(ip_address, '.', 2) as country_code,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
          GROUP BY country_code
          ORDER BY clicks DESC
          LIMIT 10
        `,

      // Top devices/browsers
      linkId ?
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
              WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
              ELSE 'Desktop'
            END as device_type,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
            AND ac.affiliate_link_id = ${linkId}
          GROUP BY device_type
          ORDER BY clicks DESC
        ` :
        prisma.$queryRaw`
          SELECT
            CASE
              WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
              WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
              ELSE 'Desktop'
            END as device_type,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
          GROUP BY device_type
          ORDER BY clicks DESC
        `,

      // Hourly distribution
      linkId ?
        prisma.$queryRaw`
          SELECT
            HOUR(clicked_at) as hour,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
            AND ac.affiliate_link_id = ${linkId}
          GROUP BY HOUR(clicked_at)
          ORDER BY hour ASC
        ` :
        prisma.$queryRaw`
          SELECT
            HOUR(clicked_at) as hour,
            COUNT(*) as clicks
          FROM affiliate_clicks ac
          INNER JOIN affiliate_links al ON ac.affiliate_link_id = al.id
          WHERE al.user_id = ${userPayload.userId}
            AND ac.clicked_at >= ${startDate}
          GROUP BY HOUR(clicked_at)
          ORDER BY hour ASC
        `,

      // Individual link performance
      prisma.affiliateLink.findMany({
        where: {
          userId: userPayload.userId,
          ...(linkId ? { id: linkId } : {})
        },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          totalClicks: true,
          totalConversions: true,
          totalCommission: true,
          commissionRate: true,
          createdAt: true,
          _count: {
            select: {
              clicks: {
                where: {
                  clickedAt: {
                    gte: startDate
                  }
                }
              },
              conversions: {
                where: {
                  convertedAt: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          totalClicks: 'desc'
        }
      })
    ]);

    // Calculate summary stats
    const totalClicks = (clicksData as any[]).reduce((sum, day) => sum + Number(day.clicks), 0);
    const totalConversions = (conversionsData as any[]).reduce((sum, day) => sum + Number(day.conversions), 0);
    const totalCommission = (conversionsData as any[]).reduce((sum, day) => sum + Number(day.commission || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

    // Calculate average order value
    const avgOrderValue = totalConversions > 0 ? (totalCommission / totalConversions) : 0;

    // Prepare chart data (merge clicks and conversions by date)
    const chartData = [];
    const dateMap = new Map();

    // Add clicks data
    (clicksData as any[]).forEach(item => {
      const date = item.date.toISOString().split('T')[0];
      dateMap.set(date, { 
        date, 
        clicks: Number(item.clicks), 
        conversions: 0, 
        commission: 0 
      });
    });

    // Add conversions data
    (conversionsData as any[]).forEach(item => {
      const date = item.date.toISOString().split('T')[0];
      const existing = dateMap.get(date) || { date, clicks: 0, conversions: 0, commission: 0 };
      existing.conversions = Number(item.conversions);
      existing.commission = Number(item.commission || 0);
      dateMap.set(date, existing);
    });

    // Convert to array and sort
    chartData.push(...Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)));



    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalClicks: Number(totalClicks),
          totalConversions: Number(totalConversions),
          totalCommission: Number(totalCommission),
          conversionRate: Number(conversionRate.toFixed(2)),
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          period: periodDays
        },
        chartData: convertBigIntToNumber(chartData),
        demographics: {
          countries: convertBigIntToNumber(topCountries),
          devices: convertBigIntToNumber(topDevices),
          hourlyDistribution: convertBigIntToNumber(hourlyStats)
        },
        linkPerformance: linkPerformance.map(link => ({
          ...link,
          totalClicks: Number(link.totalClicks),
          totalConversions: Number(link.totalConversions),
          totalCommission: Number(link.totalCommission),
          commissionRate: Number(link.commissionRate),
          periodClicks: Number(link._count.clicks),
          periodConversions: Number(link._count.conversions),
          periodConversionRate: link._count.clicks > 0 ?
            Number((link._count.conversions / link._count.clicks * 100).toFixed(2)) : 0
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
