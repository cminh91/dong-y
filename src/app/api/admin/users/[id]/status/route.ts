import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for status update
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE']),
  adminNote: z.string().optional()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Get admin user to verify role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Prevent admin from changing their own status
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không thể thay đổi trạng thái tài khoản của chính mình' },
        { status: 400 }
      );
    }

    // Prevent changing status of other admins
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Không thể thay đổi trạng thái tài khoản admin khác' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: validatedData.status,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log the status change (optional - you can create an audit log table)
    console.log(`Admin ${session.user.id} changed user ${userId} status from ${user.status} to ${validatedData.status}`);

    // Get status text for response
    const getStatusText = (status: string) => {
      switch (status) {
        case 'PENDING':
          return 'Chờ kích hoạt';
        case 'ACTIVE':
          return 'Đang hoạt động';
        case 'INACTIVE':
          return 'Đã vô hiệu hóa';
        default:
          return status;
      }
    };

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Đã cập nhật trạng thái tài khoản thành "${getStatusText(validatedData.status)}"`
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản' },
      { status: 500 }
    );
  }
}
