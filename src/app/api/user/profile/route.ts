import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for profile update
const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem thông tin tài khoản' },
        { status: 401 }
      );
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        referralCode: true,
        affiliateLevel: true,
        totalSales: true,
        totalCommission: true,
        availableBalance: true,
        commissionRate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin tài khoản' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const profile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      // Affiliate info (if applicable)
      ...(user.role === 'COLLABORATOR' || user.role === 'AGENT' ? {
        referralCode: user.referralCode,
        affiliateLevel: user.affiliateLevel,
        totalSales: Number(user.totalSales),
        totalCommission: Number(user.totalCommission),
        availableBalance: Number(user.availableBalance),
        commissionRate: Number(user.commissionRate)
      } : {})
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin tài khoản' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để cập nhật thông tin' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber || '',
        address: validatedData.address || '',
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        referralCode: true,
        affiliateLevel: true,
        totalSales: true,
        totalCommission: true,
        availableBalance: true,
        commissionRate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Transform data for frontend
    const profile = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber || '',
      address: updatedUser.address || '',
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      // Affiliate info (if applicable)
      ...(updatedUser.role === 'COLLABORATOR' || updatedUser.role === 'AGENT' ? {
        referralCode: updatedUser.referralCode,
        affiliateLevel: updatedUser.affiliateLevel,
        totalSales: Number(updatedUser.totalSales),
        totalCommission: Number(updatedUser.totalCommission),
        availableBalance: Number(updatedUser.availableBalance),
        commissionRate: Number(updatedUser.commissionRate)
      } : {})
    };

    return NextResponse.json({
      success: true,
      profile,
      message: 'Cập nhật thông tin thành công'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thông tin' },
      { status: 500 }
    );
  }
}
