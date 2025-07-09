import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/featured-products - Lấy danh sách sản phẩm nổi bật
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const categoryId = searchParams.get('categoryId');

    // Build where clause
    const where: any = {
      isFeatured: true,
      status: 'ACTIVE'
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const featuredProducts = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Format products data
    const formattedProducts = featuredProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      images: product.images ? JSON.parse(product.images as string) : [],
      category: product.category,
      isFeatured: product.isFeatured,
      stock: product.stock,
      commissionRate: Number(product.commissionRate),
      allowAffiliate: product.allowAffiliate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/featured-products - Đánh dấu sản phẩm là nổi bật
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: true },
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

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        images: product.images ? JSON.parse(product.images as string) : [],
        category: product.category,
        isFeatured: product.isFeatured
      }
    });
  } catch (error) {
    console.error('Error marking product as featured:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/featured-products - Bỏ đánh dấu sản phẩm nổi bật
export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Product removed from featured list'
    });
  } catch (error) {
    console.error('Error removing product from featured:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
