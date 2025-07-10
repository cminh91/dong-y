import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/post-categories/slug/[slug] - Lấy danh mục theo slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.postCategory.findUnique({
      where: { 
        slug: slug,
        status: 'ACTIVE'
      },
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
    console.error('Error fetching category by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
