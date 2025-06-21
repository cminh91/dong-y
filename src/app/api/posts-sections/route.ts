import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/posts-sections - Lấy bài viết cho trang chủ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status') || 'PUBLISHED';

    const whereClause: any = {
      status: status as any
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.post.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts-sections - Tạo bài viết mới
export async function POST(req: NextRequest) {
  try {
    const { 
      title, 
      slug, 
      content, 
      excerpt, 
      image, 
      authorName, 
      categoryId, 
      authorId,
      status = 'DRAFT',
      publishedAt 
    } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Kiểm tra slug đã tồn tại chưa
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 409 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image,
        authorName,
        categoryId,
        authorId,
        status: status as any,
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts-sections - Cập nhật bài viết
export async function PUT(req: NextRequest) {
  try {
    const { 
      id, 
      title, 
      slug, 
      content, 
      excerpt, 
      image, 
      authorName, 
      categoryId, 
      authorId,
      status,
      publishedAt 
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Kiểm tra slug đã tồn tại chưa (ngoại trừ post hiện tại)
    if (slug) {
      const existingPost = await prisma.post.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (existingPost) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(content && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(image !== undefined && { image }),
      ...(authorName && { authorName }),
      ...(categoryId !== undefined && { categoryId }),
      ...(authorId !== undefined && { authorId }),
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === 'PUBLISHED' && !publishedAt) {
        updateData.publishedAt = new Date();
      } else if (publishedAt) {
        updateData.publishedAt = new Date(publishedAt);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts-sections - Xóa bài viết
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
