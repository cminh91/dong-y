import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/post-categories/[id] - Lấy chi tiết danh mục
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.postCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
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

    const formattedCategory = {
      ...category,
      postsCount: category._count.posts
    };

    return NextResponse.json({
      success: true,
      data: formattedCategory
    });

  } catch (error) {
    console.error('Error fetching post category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/post-categories/[id] - Cập nhật danh mục
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
      image,
      status,
      sortOrder
    } = body;

    // Check if category exists
    const existingCategory = await prisma.postCategory.findUnique({
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
      const slugExists = await prisma.postCategory.findFirst({
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

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (status !== undefined) updateData.status = status;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updatedCategory = await prisma.postCategory.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error updating post category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/post-categories/[id] - Xóa danh mục
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.postCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
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

    // Check if category has posts
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category that has posts' },
        { status: 400 }
      );
    }

    await prisma.postCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
