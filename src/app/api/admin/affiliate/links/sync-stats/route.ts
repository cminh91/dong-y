import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/affiliate/links/sync-stats - Sync affiliate link stats
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (linkId) {
      // Sync specific link
      await syncLinkStats(linkId)
      return NextResponse.json({
        success: true,
        message: 'Link stats synced successfully'
      })
    } else {
      // Sync all links
      const links = await prisma.affiliateLink.findMany({
        select: { id: true }
      })

      let synced = 0
      for (const link of links) {
        await syncLinkStats(link.id)
        synced++
      }

      return NextResponse.json({
        success: true,
        message: `${synced} link stats synced successfully`
      })
    }

  } catch (error) {
    console.error('Error syncing link stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function syncLinkStats(linkId: string) {
  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    include: {
      clicks: {
        select: {
          id: true,
          clickedAt: true
        }
      },
      conversions: {
        select: {
          id: true,
          orderValue: true,
          commissionAmount: true,
          convertedAt: true
        }
      }
    }
  })

  if (!link) return

  const totalClicks = link.clicks.length
  const totalConversions = link.conversions.length
  const totalCommission = link.conversions.reduce((sum, c) => sum + c.commissionAmount, 0)
  
  const lastClick = link.clicks.length > 0 
    ? link.clicks.sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())[0]
    : null

  const lastConversion = link.conversions.length > 0
    ? link.conversions.sort((a, b) => new Date(b.convertedAt).getTime() - new Date(a.convertedAt).getTime())[0]
    : null

  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      totalClicks,
      totalConversions,
      totalCommission,
      lastClickAt: lastClick?.clickedAt || null,
      lastConversionAt: lastConversion?.convertedAt || null
    }
  })
}
