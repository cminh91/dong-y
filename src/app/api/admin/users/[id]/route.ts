import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'desc' }
          ]
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
