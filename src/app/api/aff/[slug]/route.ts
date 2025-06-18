import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/aff/[slug] - Handle affiliate link clicks
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    
    // Get client info
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Find affiliate link
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            referralCode: true
          }
        },
        product: {
          select: {
            id: true,
            slug: true,
            status: true
          }
        },
        category: {
          select: {
            id: true,
            slug: true
          }
        }
      }
    })

    if (!affiliateLink) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if link is active and not expired
    if (affiliateLink.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (affiliateLink.expiresAt && new Date() > affiliateLink.expiresAt) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if user is active
    if (affiliateLink.user.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Record click
    await prisma.affiliateClick.create({
      data: {
        affiliateLinkId: affiliateLink.id,
        ipAddress,
        userAgent,
        referer,
        clickedAt: new Date()
      }
    })

    // Determine redirect URL
    let redirectUrl: string

    if (affiliateLink.type === 'PRODUCT' && affiliateLink.product) {
      // Check if product is active
      if (affiliateLink.product.status !== 'ACTIVE') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      redirectUrl = `/san-pham/${affiliateLink.product.slug}`
    } else if (affiliateLink.type === 'CATEGORY' && affiliateLink.category) {
      redirectUrl = `/danh-muc/${affiliateLink.category.slug}`
    } else {
      // General link - redirect to homepage or specific page
      redirectUrl = '/'
    }

    // Add affiliate tracking parameters
    const targetUrl = new URL(redirectUrl, request.url)
    targetUrl.searchParams.set('ref', affiliateLink.user.referralCode || affiliateLink.user.id)
    targetUrl.searchParams.set('aff', affiliateLink.id)

    // Set tracking cookie
    const response = NextResponse.redirect(targetUrl)
    
    // Set affiliate tracking cookie (30 days default)
    const cookieExpiry = new Date()
    cookieExpiry.setDate(cookieExpiry.getDate() + 30)
    
    response.cookies.set('aff_ref', affiliateLink.user.id, {
      expires: cookieExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    response.cookies.set('aff_link', affiliateLink.id, {
      expires: cookieExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response

  } catch (error) {
    console.error('Error processing affiliate link:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
