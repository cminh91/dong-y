import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const STAFF_ROLES = ['STAFF', 'ADMIN']; // Chỉ lấy nhân viên và admin

// Schema cho việc tạo nhân viên mới
const createStaffSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Họ và tên không được để trống"),
  phoneNumber: z.string().min(1, "Số điện thoại không được để trống"),
  address: z.string().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["STAFF", "ADMIN"]),
});

export async function GET(request: NextRequest) {
  try {    // Kiểm tra xác thực và quyền xem danh sách users
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Lấy thông tin user và quyền
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền xem danh sách users
    if (currentUser.role !== 'ADMIN') {
      // Nếu là STAFF, kiểm tra quyền 'users.view'
      const permissionsKey = `user_permissions_${currentUser.id}`;
      const permissionsSetting = await prisma.systemSetting.findUnique({
        where: { key: permissionsKey }
      });      const permissions = permissionsSetting?.value as string[] || [];
      if (!permissions.includes('users.view')) {
        return NextResponse.json(
          { error: 'Bạn không có quyền xem danh sách người dùng' },
          { status: 403 }
        );
      }
    }

    // Lấy tham số truy vấn
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Xây dựng điều kiện where với role chỉ là STAFF hoặc ADMIN
    const where: any = {
      role: {
        in: role && role !== 'all' ? [role as UserRole] : STAFF_ROLES
      }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } }
      ];
    }

    // Lấy tổng số lượng nhân viên
    const totalCount = await prisma.user.count({ where });

    // Lấy danh sách nhân viên với phân trang
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { role: 'desc' }, // ADMIN trước, sau đó đến STAFF
        { status: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Lấy quyền cho từng nhân viên
    const userIds = users.map(user => user.id);
    const permissionsSettings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: userIds.map(id => `user_permissions_${id}`)
        }
      }
    });

    // Tạo map quyền nhân viên
    const permissionsMap = permissionsSettings.reduce((acc, setting) => {
      const userId = setting.key.replace('user_permissions_', '');
      acc[userId] = setting.value as string[];
      return acc;
    }, {} as Record<string, string[]>);

    // Chuyển đổi dữ liệu nhân viên cho frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      permissions: permissionsMap[user.id] || []
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Lỗi khi tải danh sách nhân viên:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách nhân viên' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = createStaffSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email đã tồn tại trong hệ thống" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        address: validatedData.address ?? "",
        password: hashedPassword,
        role: validatedData.role,
        status: 'ACTIVE', // Tài khoản nhân viên luôn được kích hoạt ngay khi tạo
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error creating staff:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Có lỗi xảy ra khi tạo tài khoản nhân viên" },
      { status: 500 }
    );
  }
}