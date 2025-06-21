import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface AffiliatePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AffiliatePage({ params }: AffiliatePageProps) {
  const { slug } = await params;

  // Find affiliate link
  const affiliateLink = await prisma.affiliateLink.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          referralCode: true,
          commissionRate: true
        }
      },
      product: {
        select: {
          id: true,
          slug: true,
          status: true
        }
      }
    }
  });

  // Check if affiliate link exists and is active
  if (!affiliateLink || affiliateLink.status !== 'ACTIVE') {
    redirect('/san-pham');
  }

  // Check if user is valid affiliate
  const user = affiliateLink.user;
  if (!user || (user.role !== 'COLLABORATOR' && user.role !== 'AGENT' && user.commissionRate <= 0)) {
    redirect('/san-pham');
  }

  // Check if product exists and is active
  const product = affiliateLink.product;
  if (!product || product.status !== 'ACTIVE') {
    redirect('/san-pham');
  }

  // Track click (in background, don't wait)
  prisma.affiliateClick.create({
    data: {
      affiliateLinkId: affiliateLink.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Unknown',
      referer: null
    }
  }).then(() => {
    // Update total clicks
    return prisma.affiliateLink.update({
      where: { id: affiliateLink.id },
      data: {
        totalClicks: { increment: 1 },
        lastClickAt: new Date()
      }
    });
  }).catch((error) => {
    console.error('Error tracking click:', error);
  });

  // Redirect to product page with affiliate tracking
  const redirectUrl = `/san-pham/${product.slug}?aff=${affiliateLink.slug}&ref=${user.referralCode}`;
  redirect(redirectUrl);
}
