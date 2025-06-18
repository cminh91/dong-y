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

// GET /api/affiliate-links/[slug] - Lấy chi tiết affiliate link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { slug }
    });

    if (!affiliateLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 }
      );
    }

    // Check if link is active and not expired
    if (affiliateLink.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Affiliate link is inactive' },
        { status: 400 }
      );
    }

    if (affiliateLink.expiresAt && new Date() > affiliateLink.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: affiliateLink
    });

  } catch (error) {
    console.error('Error fetching affiliate link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/affiliate-links/[slug] - Cập nhật affiliate link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      description,
      status,
      commissionRate,
      expiresAt
    } = body;

    // Check if affiliate link exists and belongs to user
    const existingLink = await prisma.affiliateLink.findUnique({
      where: { slug }
    });

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 }
      );
    }

    if (existingLink.userId !== userPayload.userId && userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const updatedLink = await prisma.affiliateLink.update({
      where: { slug },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedLink
    });

  } catch (error) {
    console.error('Error updating affiliate link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/affiliate-links/[slug] - Xóa affiliate link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;

    // Check if affiliate link exists and belongs to user
    const existingLink = await prisma.affiliateLink.findUnique({
      where: { slug }
    });

    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 }
      );
    }

    if (existingLink.userId !== userPayload.userId && userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.affiliateLink.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Affiliate link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting affiliate link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
