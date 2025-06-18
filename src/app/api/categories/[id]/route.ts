import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories/[id] - Lấy chi tiết danh mục
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            products: true
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

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Cập nhật danh mục
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
      parentId,
      status
    } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if slug already exists (excluding current category)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
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

    // Check if parent exists (if parentId provided)
    if (parentId && parentId !== existingCategory.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        );
      }

      // Prevent circular reference
      if (parentId === id) {
        return NextResponse.json(
          { success: false, error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(status && { status })
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            products: true
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Xóa danh mục
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
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

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with products' },
        { status: 400 }
      );
    }

    // Check if category has children
    if (existingCategory._count.children > 0) {
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
