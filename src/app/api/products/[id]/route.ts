import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] - Lấy chi tiết sản phẩm
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching product with ID:', id);

    // Try to find by ID first, then by slug if ID doesn't work
    let product = await prisma.product.findUnique({
      where: { id },
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

    // If not found by ID, try by slug
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: id },
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
    }

    console.log('Found product:', product ? 'Yes' : 'No');

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

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
      images: (() => {
        if (product.images) {
          try {
            const parsedImages = JSON.parse(product.images as string);
            return Array.isArray(parsedImages) ? parsedImages : [parsedImages];
          } catch (e) {
            // If parsing fails, assume it's a single string URL and wrap it in an array
            return [product.images as string];
          }
        }
        return [];
      })(),
      category: product.category,
      isFeatured: product.isFeatured,
      status: product.status,
      // NEW: Commission fields
      commissionRate: Number(product.commissionRate),
      commissionRatePercent: Number(product.commissionRate * 100),
      allowAffiliate: product.allowAffiliate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      content,
      price,
      salePrice,
      sku,
      stock,
      categoryId,
      images,
      isFeatured,
      status,
      // NEW: Commission fields
      commissionRate,
      allowAffiliate
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug already exists (excluding current product)
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: id }
        }
      });

      if (skuExists) {
        return NextResponse.json(
          { success: false, error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    // Check if category exists
    if (categoryId && categoryId !== existingProduct.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(price !== undefined && { price: price }),
        ...(salePrice !== undefined && { salePrice: salePrice }),
        ...(sku && { sku }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId && { categoryId }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(status && { status }),
        // NEW: Commission fields
        ...(commissionRate !== undefined && { commissionRate: commissionRate }),
        ...(allowAffiliate !== undefined && { allowAffiliate })
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

    // Format response
    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      slug: updatedProduct.slug,
      description: updatedProduct.description,
      content: updatedProduct.content,
      price: Number(updatedProduct.price),
      salePrice: updatedProduct.salePrice ? Number(updatedProduct.salePrice) : null,
      sku: updatedProduct.sku,
      stock: updatedProduct.stock,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images as string) : [],
      category: updatedProduct.category,
      isFeatured: updatedProduct.isFeatured,
      status: updatedProduct.status,
      // NEW: Commission fields
      commissionRate: Number(updatedProduct.commissionRate),
      commissionRatePercent: Number(updatedProduct.commissionRate * 100),
      allowAffiliate: updatedProduct.allowAffiliate,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    await prisma.$transaction(async (tx) => {
      // Xóa các affiliate links liên quan (nếu có)
      await tx.affiliateLink.deleteMany({
        where: { productId: id }
      });

      // Xóa các commissions liên quan (nếu có)
      await tx.commission.deleteMany({
        where: { productId: id }
      });

      // CartItems sẽ tự động xóa do có onDelete: Cascade
      // OrderItems sẽ có productId = null do có onDelete: SetNull, nhưng vẫn giữ productName và productSku

      // Cuối cùng xóa sản phẩm
      await tx.product.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
