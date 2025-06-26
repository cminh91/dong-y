import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Lấy thông tin admin để xác minh quyền
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

    const { permissions } = await request.json();
    const userId = params.id;

    // Xác thực mảng quyền
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Danh sách quyền không hợp lệ' },
        { status: 400 }
      );
    }

    // Kiểm tra người dùng tồn tại và không phải admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, fullName: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Không thể thay đổi quyền của quản trị viên' },
        { status: 403 }
      );
    }

    // Cập nhật quyền người dùng
    // Vì chúng ta không có bảng permissions riêng, chúng ta sẽ lưu dưới dạng JSON
    // Sử dụng SystemSetting để lưu trữ quyền
    
    const permissionsKey = `user_permissions_${userId}`;
    
    await prisma.systemSetting.upsert({
      where: { key: permissionsKey },
      update: {
        value: permissions,
        description: `Quyền của người dùng: ${targetUser.fullName}`,
        category: 'user_permissions'
      },
      create: {
        key: permissionsKey,
        value: permissions,
        description: `Quyền của người dùng: ${targetUser.fullName}`,
        category: 'user_permissions'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật quyền thành công',
      permissions
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật quyền người dùng:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật quyền' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kiểm tra xác thực và quyền admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Lấy thông tin admin để xác minh quyền
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

    const userId = params.id;
    const permissionsKey = `user_permissions_${userId}`;
    
    // Lấy quyền người dùng từ SystemSetting
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