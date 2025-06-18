import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/posts - Lấy danh sách bài viết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const authorId = searchParams.get('authorId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Author filter
    if (authorId) {
      where.authorId = authorId;
    }

    // Search filter (MySQL compatible)
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'publishedAt') {
      orderBy.publishedAt = sortOrder;
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get posts and total count
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
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
        orderBy,
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format posts data
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      image: post.image,
      status: post.status,
      authorName: post.authorName,
      category: post.category,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        posts: formattedPosts,
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
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Tạo bài viết mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      image,
      status = 'DRAFT',
      authorName,
      categoryId,
      publishedAt
    } = body;

    // Validate required fields
    if (!title || !slug || !content || !authorName) {
      return NextResponse.json(
        { success: false, error: 'Title, slug, content, and authorName are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }



    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        status,
        authorName,
        categoryId,
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
