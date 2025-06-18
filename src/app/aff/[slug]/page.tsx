import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface AffiliatePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AffiliatePage({ params }: AffiliatePageProps) {
  const { slug } = await params;

  try {
    // Get affiliate link
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { slug }
    });

    if (!affiliateLink) {
      // Redirect to 404 or home page
      redirect('/san-pham');
    }

    // Check if link is active and not expired
    if (affiliateLink.status !== 'ACTIVE') {
      redirect('/san-pham');
    }

    if (affiliateLink.expiresAt && new Date() > affiliateLink.expiresAt) {
      redirect('/san-pham');
    }

    // Track click (this will be done client-side to avoid blocking the redirect)
    // We'll use a client component for this

    // Determine redirect URL
    let redirectUrl = '/san-pham'; // Default to products listing

    switch (affiliateLink.type) {
      case 'PRODUCT':
        if (affiliateLink.productId) {
          // Get product details to get the slug
          const product = await prisma.product.findUnique({
            where: { id: affiliateLink.productId },
            select: { slug: true }
          });

          if (product?.slug) {
            // Redirect to specific product detail page
            redirectUrl = `/san-pham/${product.slug}`;
          } else {
            // Fallback to products listing if product not found
            redirectUrl = '/san-pham';
          }
        }
        break;
      case 'CATEGORY':
        if (affiliateLink.categoryId) {
          // Get category details to get the slug
          const category = await prisma.category.findUnique({
            where: { id: affiliateLink.categoryId },
            select: { slug: true }
          });

          if (category?.slug) {
            // Redirect to category page
            redirectUrl = `/danh-muc/${category.slug}`;
          } else {
            // Fallback to products listing
            redirectUrl = '/san-pham';
          }
        }
        break;
      case 'GENERAL':
      default:
        redirectUrl = '/san-pham';
        break;
    }

    // Add affiliate tracking parameter
    const url = new URL(redirectUrl, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    url.searchParams.set('aff', slug);

    redirect(url.toString());

  } catch (error) {
    console.error('Error processing affiliate link:', error);
    redirect('/san-pham');
  }
}
