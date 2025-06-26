import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Lấy thông tin user để xác minh role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Nếu là ADMIN, trả về tất cả quyền
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        permissions: ['*'] // Ký hiệu đặc biệt cho biết có tất cả quyền
      });
    }

    // Nếu là STAFF, lấy quyền từ SystemSetting
    const permissionsKey = `user_permissions_${session.user.id}`;
    const permissionsSetting = await prisma.systemSetting.findUnique({
      where: { key: permissionsKey }
    });

    const permissions = permissionsSetting?.value || [];

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('Lỗi khi tải quyền người dùng:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải quyền người dùng' },
      { status: 500 }
    );
  }
}
