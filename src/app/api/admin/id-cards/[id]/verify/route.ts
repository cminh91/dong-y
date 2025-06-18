import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for ID card verification
const verifyIdCardSchema = z.object({
  action: z.enum(['VERIFY', 'REJECT'])
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

    const { id: idCardId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = verifyIdCardSchema.parse(body);

    // Check if ID card exists
    const idCard = await prisma.idCard.findUnique({
      where: { id: idCardId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!idCard) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin CCCD' },
        { status: 404 }
      );
    }

    // Update ID card verification status
    const now = new Date();
    const updatedIdCard = await prisma.idCard.update({
      where: { id: idCardId },
      data: validatedData.action === 'VERIFY'
        ? {
            verifiedAt: now,
            rejectedAt: null, // Clear rejection if previously rejected
            updatedAt: now
          }
        : {
            verifiedAt: null, // Clear verification if previously verified
            rejectedAt: now,
            updatedAt: now
          }
    });

    // Log the verification action
    console.log(`Admin ${session.user.id} ${validatedData.action.toLowerCase()} ID card ${idCardId} for user ${idCard.user.id}`);

    // Get action text for response
    const getActionText = (action: string) => {
      switch (action) {
        case 'VERIFY':
          return 'đã duyệt';
        case 'REJECT':
          return 'đã từ chối';
        default:
          return action;
      }
    };

    // Determine current status for response
    const currentStatus = updatedIdCard.verifiedAt
      ? 'VERIFIED'
      : updatedIdCard.rejectedAt
        ? 'REJECTED'
        : 'PENDING';

    return NextResponse.json({
      success: true,
      idCard: {
        id: updatedIdCard.id,
        verifiedAt: updatedIdCard.verifiedAt?.toISOString(),
        rejectedAt: updatedIdCard.rejectedAt?.toISOString(),
        status: currentStatus
      },
      message: `Đã ${getActionText(validatedData.action)} CCCD của ${idCard.user.fullName}`
    });

  } catch (error) {
    console.error('Error verifying ID card:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi duyệt CCCD' },
      { status: 500 }
    );
  }
}
