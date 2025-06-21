import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/product-categories-new - Lấy danh mục sản phẩm
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const parentId = searchParams.get('parentId');
    const status = searchParams.get('status') || 'ACTIVE';
    const limit = parseInt(searchParams.get('limit') || '0');

    const whereClause: any = {
      status: status as any
    };

    // Nếu có parentId, lọc theo parent
    if (parentId) {
      whereClause.parentId = parentId;
    } else if (parentId === null || searchParams.get('rootOnly') === 'true') {
      // Chỉ lấy danh mục gốc (không có parent)
      whereClause.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        children: {
          where: { status: 'ACTIVE' },
          orderBy: { sortOrder: 'asc' }
        },
        ...(includeProducts && {
          products: {
            where: { status: 'ACTIVE' },
            take: 5, // Giới hạn số sản phẩm cho mỗi danh mục
            orderBy: { createdAt: 'desc' }
          }
        }),
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            },
            children: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' },
      ...(limit > 0 && { take: limit })
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/product-categories-new - Tạo danh mục mới
export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      slug, 
      description, 
      image, 
      parentId, 
      sortOrder = 0 
    } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
        sortOrder,
        status: 'ACTIVE'
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT /api/product-categories-new - Cập nhật danh mục
export async function PUT(req: NextRequest) {
  try {
    const { 
      id, 
      name, 
      slug, 
      description, 
      image, 
      parentId, 
      status, 
      sortOrder 
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Kiểm tra slug đã tồn tại chưa (ngoại trừ category hiện tại)
    if (slug) {
      const existingCategory = await prisma.category.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId }),
        ...(status && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedAt: new Date()
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/product-categories-new - Xóa danh mục
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Kiểm tra xem danh mục có sản phẩm hoặc danh mục con không
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with products' },
        { status: 400 }
      );
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
