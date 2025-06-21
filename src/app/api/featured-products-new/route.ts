import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/featured-products - Lấy sản phẩm nổi bật
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const offset = parseInt(searchParams.get('offset') || '0');

    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
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
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.product.count({
      where: {
        isFeatured: true,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      data: featuredProducts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}

// POST /api/featured-products - Đặt sản phẩm làm nổi bật
export async function POST(req: NextRequest) {
  try {
    const { productId, isFeatured } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isFeatured: isFeatured ?? true,
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating featured product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update featured product' },
      { status: 500 }
    );
  }
}

// PUT /api/featured-products - Cập nhật thông tin sản phẩm nổi bật
export async function PUT(req: NextRequest) {
  try {
    const { 
      id, 
      name, 
      slug, 
      description, 
      content, 
      price, 
      salePrice, 
      sku, 
      stock, 
      images, 
      categoryId,
      commissionRate,
      allowAffiliate 
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(price && { price }),
        ...(salePrice !== undefined && { salePrice }),
        ...(sku && { sku }),
        ...(stock !== undefined && { stock }),
        ...(images && { images }),
        ...(categoryId && { categoryId }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(allowAffiliate !== undefined && { allowAffiliate }),
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/featured-products - Bỏ sản phẩm khỏi danh sách nổi bật
export async function DELETE(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        isFeatured: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product removed from featured list'
    });
  } catch (error) {
    console.error('Error removing featured product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove featured product' },
      { status: 500 }
    );
  }
}
