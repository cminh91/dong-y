import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get product by slug
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: 'ACTIVE'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format product data
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      content: product.content,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      sku: product.sku,
      stock: product.stock,
      images: product.images ? JSON.parse(product.images as string) : [],
      category: product.category,
      isFeatured: product.isFeatured,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    // Format related products
    const formattedRelatedProducts = relatedProducts.map(relatedProduct => ({
      id: relatedProduct.id,
      name: relatedProduct.name,
      slug: relatedProduct.slug,
      description: relatedProduct.description,
      price: Number(relatedProduct.price),
      salePrice: relatedProduct.salePrice ? Number(relatedProduct.salePrice) : null,
      images: relatedProduct.images ? JSON.parse(relatedProduct.images as string) : [],
      category: relatedProduct.category,
      isFeatured: relatedProduct.isFeatured,
      stock: relatedProduct.stock
    }));

    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct,
        relatedProducts: formattedRelatedProducts
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}