import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

const verifyToken = (token: string): UserPayload | null => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, secret) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

// GET /api/affiliate-links - Lấy danh sách affiliate links của user
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPayload = verifyToken(authToken);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'product' | 'category' | 'general'
    const status = searchParams.get('status'); // 'active' | 'inactive'

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: userPayload.userId
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const [affiliateLinks, totalCount] = await Promise.all([
      prisma.affiliateLink.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.affiliateLink.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        affiliateLinks,
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
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/affiliate-links - Tạo affiliate link mới
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPayload = verifyToken(authToken);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user has permission to create affiliate links
    if (!['COLLABORATOR', 'AGENT', 'ADMIN'].includes(userPayload.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      type, // 'product' | 'category' | 'general'
      productId,
      categoryId,
      title,
      description,
      customSlug,
      commissionRate,
      expiresAt
    } = body;

    // Convert type to uppercase for database enum
    const dbType = type.toUpperCase() as 'GENERAL' | 'PRODUCT' | 'CATEGORY';

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Validate type-specific requirements
    if (dbType === 'PRODUCT' && !productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for product links' },
        { status: 400 }
      );
    }

    if (dbType === 'CATEGORY' && !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required for category links' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const generatedSlug = customSlug || `${userPayload.userId.slice(-4)}-${timestamp}-${randomStr}`;

    // Check if slug already exists
    const existingLink = await prisma.affiliateLink.findUnique({
      where: { slug: generatedSlug }
    });

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create affiliate link
    const affiliateLink = await prisma.affiliateLink.create({
      data: {
        userId: userPayload.userId,
        type: dbType,
        productId: dbType === 'PRODUCT' ? productId : null,
        categoryId: dbType === 'CATEGORY' ? categoryId : null,
        title,
        description,
        slug: generatedSlug,
        commissionRate: commissionRate || 5.0, // Default 5%
        status: 'ACTIVE',
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: affiliateLink
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
