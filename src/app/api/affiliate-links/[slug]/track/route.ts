import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/affiliate-links/[slug]/track - Track click hoặc conversion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { type, orderId, orderValue } = body; // type: 'click' | 'conversion'

    // Get affiliate link
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!affiliateLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 }
      );
    }

    // Check if link is active and not expired
    if (affiliateLink.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Affiliate link is inactive' },
        { status: 400 }
      );
    }

    if (affiliateLink.expiresAt && new Date() > affiliateLink.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link has expired' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    if (type === 'click') {
      // Track click
      const click = await prisma.affiliateClick.create({
        data: {
          affiliateLinkId: affiliateLink.id,
          ipAddress: ip,
          userAgent,
          referer,
          clickedAt: new Date()
        }
      });

      // Update affiliate link click count
      await prisma.affiliateLink.update({
        where: { id: affiliateLink.id },
        data: {
          totalClicks: {
            increment: 1
          },
          lastClickAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          clickId: click.id,
          redirectUrl: await getRedirectUrl(affiliateLink)
        }
      });

    } else if (type === 'conversion') {
      // Track conversion
      if (!orderId || !orderValue) {
        return NextResponse.json(
          { success: false, error: 'Order ID and value are required for conversions' },
          { status: 400 }
        );
      }

      // Check if conversion already exists for this order
      const existingConversion = await prisma.affiliateConversion.findFirst({
        where: {
          affiliateLinkId: affiliateLink.id,
          orderId
        }
      });

      if (existingConversion) {
        return NextResponse.json(
          { success: false, error: 'Conversion already tracked for this order' },
          { status: 400 }
        );
      }

      // Calculate commission
      const commissionAmount = (orderValue * affiliateLink.commissionRate) / 100;

      const conversion = await prisma.affiliateConversion.create({
        data: {
          affiliateLinkId: affiliateLink.id,
          orderId,
          orderValue,
          commissionRate: affiliateLink.commissionRate,
          commissionAmount,
          convertedAt: new Date()
        }
      });

      // Update affiliate link conversion stats
      await prisma.affiliateLink.update({
        where: { id: affiliateLink.id },
        data: {
          totalConversions: {
            increment: 1
          },
          totalCommission: {
            increment: commissionAmount
          },
          lastConversionAt: new Date()
        }
      });

      // Update user total commission
      await prisma.user.update({
        where: { id: affiliateLink.userId },
        data: {
          totalCommission: {
            increment: commissionAmount
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          conversionId: conversion.id,
          commissionAmount
        }
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid tracking type' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error tracking affiliate link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getRedirectUrl(affiliateLink: any): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  switch (affiliateLink.type) {
    case 'PRODUCT':
      if (affiliateLink.productId) {
        // Get product slug from database
        const product = await prisma.product.findUnique({
          where: { id: affiliateLink.productId },
          select: { slug: true }
        });

        if (product?.slug) {
          return `${baseUrl}/san-pham/${product.slug}`;
        }
      }
      return `${baseUrl}/san-pham`;

    case 'CATEGORY':
      if (affiliateLink.categoryId) {
        // Get category slug from database
        const category = await prisma.category.findUnique({
          where: { id: affiliateLink.categoryId },
          select: { slug: true }
        });

        if (category?.slug) {
          return `${baseUrl}/danh-muc/${category.slug}`;
        }
      }
      return `${baseUrl}/san-pham`;

    case 'GENERAL':
    default:
      return `${baseUrl}/san-pham`;
  }
}
