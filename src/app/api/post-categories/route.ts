import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/post-categories - Lấy danh sách danh mục bài viết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [categories, totalCount] = await Promise.all([
      prisma.postCategory.findMany({
        where,
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
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.postCategory.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format categories data
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      status: category.status,
      sortOrder: category.sortOrder,
      postsCount: category._count.posts,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching post categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/post-categories - Tạo danh mục mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      image,
      status = 'ACTIVE',
      sortOrder = 0
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.postCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.postCategory.create({
      data: {
        name,
        slug,
        description,
        image,
        status,
        sortOrder
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
