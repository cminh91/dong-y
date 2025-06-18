import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get post by slug (only published posts for public)
    const post = await prisma.post.findUnique({
      where: {
        slug,
        status: 'PUBLISHED'
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

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get related posts (same category or recent posts)
    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: 'PUBLISHED',
        categoryId: post.categoryId // Same category
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
      take: 3,
      orderBy: {
        publishedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
