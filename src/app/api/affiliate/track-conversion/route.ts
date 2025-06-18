import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/affiliate/track-conversion - Track affiliate conversions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, orderValue, customerId } = body

    if (!orderId || !orderValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get affiliate tracking from cookies
    const affRef = request.cookies.get('aff_ref')?.value
    const affLink = request.cookies.get('aff_link')?.value

    if (!affRef || !affLink) {
      // No affiliate tracking found
      return NextResponse.json({
        success: true,
        message: 'No affiliate tracking found'
      })
    }

    // Find the affiliate link and user
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { id: affLink },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            commissionRate: true,
            referredBy: true,
            referredByUser: {
              select: {
                id: true,
                status: true,
                commissionRate: true
              }
            }
          }
        }
      }
    })

    if (!affiliateLink || affiliateLink.user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Affiliate link not found or inactive'
      })
    }

    // Check if conversion already exists for this order
    const existingConversion = await prisma.affiliateConversion.findFirst({
      where: {
        orderId,
        affiliateLinkId: affLink
      }
    })

    if (existingConversion) {
      return NextResponse.json({
        success: true,
        message: 'Conversion already tracked'
      })
    }

    // Start transaction to create conversion and commissions
    const result = await prisma.$transaction(async (tx) => {
      // Create conversion record
      const conversion = await tx.affiliateConversion.create({
        data: {
          affiliateLinkId: affLink,
          orderId,
          orderValue,
          commissionRate: affiliateLink.commissionRate,
          commissionAmount: orderValue * affiliateLink.commissionRate,
          convertedAt: new Date()
        }
      })

      const commissions = []

      // Level 1 commission (direct affiliate)
      const level1Commission = orderValue * affiliateLink.commissionRate
      
      const level1CommissionRecord = await tx.commission.create({
        data: {
          userId: affiliateLink.user.id,
          orderId,
          referredUserId: customerId,
          level: 1,
          orderAmount: orderValue,
          commissionRate: affiliateLink.commissionRate,
          amount: level1Commission,
          status: 'PENDING'
        }
      })

      commissions.push(level1CommissionRecord)

      // Update user's total commission
      await tx.user.update({
        where: { id: affiliateLink.user.id },
        data: {
          totalCommission: {
            increment: level1Commission
          }
        }
      })

      // Level 2 commission (if affiliate was referred by someone)
      if (affiliateLink.user.referredByUser && affiliateLink.user.referredByUser.status === 'ACTIVE') {
        const level2Rate = affiliateLink.user.referredByUser.commissionRate * 0.3 // 30% of their rate
        const level2Commission = orderValue * level2Rate

        const level2CommissionRecord = await tx.commission.create({
          data: {
            userId: affiliateLink.user.referredBy!,
            orderId,
            referredUserId: affiliateLink.user.id,
            level: 2,
            orderAmount: orderValue,
            commissionRate: level2Rate,
            amount: level2Commission,
            status: 'PENDING'
          }
        })

        commissions.push(level2CommissionRecord)

        // Update level 2 user's total commission
        await tx.user.update({
          where: { id: affiliateLink.user.referredBy! },
          data: {
            totalCommission: {
              increment: level2Commission
            }
          }
        })
      }

      return { conversion, commissions }
    })

    // Clear affiliate tracking cookies after successful conversion
    const response = NextResponse.json({
      success: true,
      data: {
        conversionId: result.conversion.id,
        commissionsCreated: result.commissions.length,
        totalCommissionAmount: result.commissions.reduce((sum, c) => sum + Number(c.amount), 0)
      }
    })

    // Clear tracking cookies
    response.cookies.delete('aff_ref')
    response.cookies.delete('aff_link')

    return response

  } catch (error) {
    console.error('Error tracking conversion:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/affiliate/track-conversion - Get current tracking info (for debugging)
export async function GET(request: NextRequest) {
  try {
    const affRef = request.cookies.get('aff_ref')?.value
    const affLink = request.cookies.get('aff_link')?.value

    if (!affRef || !affLink) {
      return NextResponse.json({
        success: true,
        tracking: null,
        message: 'No affiliate tracking found'
      })
    }

    // Get affiliate info
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { id: affLink },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true
          }
        },
        product: {
          select: {
            name: true,
            slug: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      tracking: {
        affiliateUserId: affRef,
        affiliateLinkId: affLink,
        affiliateLink: affiliateLink ? {
          slug: affiliateLink.slug,
          type: affiliateLink.type,
          commissionRate: affiliateLink.commissionRate,
          user: affiliateLink.user,
          product: affiliateLink.product,
          category: affiliateLink.category
        } : null
      }
    })

  } catch (error) {
    console.error('Error getting tracking info:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
