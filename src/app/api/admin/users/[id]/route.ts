import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export async function GET(
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

    // Get user details with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        idCards: {
          orderBy: { createdAt: 'desc' }
        },
        bankAccounts: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            orders: true,
            referredUsers: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Transform user data for frontend
    const userDetails = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      affiliateLevel: user.affiliateLevel,
      totalSales: Number(user.totalSales),
      totalCommission: Number(user.totalCommission),
      availableBalance: Number(user.availableBalance),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      ordersCount: user._count.orders,
      referralsCount: user._count.referredUsers,
      idCards: user.idCards.map(idCard => {
        // Determine status based on timestamps
        const status = idCard.verifiedAt
          ? 'VERIFIED'
          : idCard.rejectedAt
            ? 'REJECTED'
            : 'PENDING';

        return {
          id: idCard.id,
          idCardNumber: idCard.idCardNumber,
          frontImage: idCard.frontImage,
          backImage: idCard.backImage,
          status: status,
          verifiedAt: idCard.verifiedAt?.toISOString(),
          rejectedAt: idCard.rejectedAt?.toISOString(),
          createdAt: idCard.createdAt.toISOString()
        };
      }),
      bankAccounts: user.bankAccounts.map(account => ({
        id: account.id,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        branch: account.branch,
        createdAt: account.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      user: userDetails
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin người dùng' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id: userId } = params;
    const { email, fullName, phoneNumber, address, password, role } = await request.json();

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    // Verify email uniqueness if changed
    if (email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email đã được sử dụng bởi tài khoản khác' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      fullName,
      phoneNumber,
      address,
      role,
      updatedAt: new Date()
    };

    // Only hash and update password if provided
    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin nhân viên thành công',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thông tin người dùng' },
      { status: 500 }
    );
  }
}
