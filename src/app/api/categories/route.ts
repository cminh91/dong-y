import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Lấy danh sách danh mục
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const parentId = searchParams.get('parentId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter (MySQL compatible)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Parent filter
    if (parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    // Get categories and total count
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        categories,
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
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Tạo danh mục mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      parentId,
      status = 'ACTIVE'
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Check if parent exists (if parentId provided)
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        status
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
      data: category
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}