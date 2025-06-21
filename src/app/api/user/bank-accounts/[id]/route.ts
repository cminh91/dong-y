import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bank account update
const updateBankAccountSchema = z.object({
  bankName: z.enum(['VIETCOMBANK', 'VIETINBANK', 'BIDV', 'AGRIBANK', 'TECHCOMBANK', 'MBBANK', 'TPBANK']).optional(),
  accountNumber: z.string().min(1, 'Số tài khoản không được để trống').optional(),
  accountName: z.string().min(1, 'Tên chủ tài khoản không được để trống').optional(),
  branch: z.string().min(1, 'Chi nhánh không được để trống').optional(),
  // isPrimary field removed
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để cập nhật tài khoản ngân hàng' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateBankAccountSchema.parse(body);

    // Check if bank account exists and belongs to user
    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản ngân hàng' },
        { status: 404 }
      );
    }

    // isPrimary field removed - using single bank account per user

    // Update bank account
    const updatedAccount = await prisma.bankAccount.update({
      where: { id: id },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      bankAccount: {
        id: updatedAccount.id,
        bankName: updatedAccount.bankName,
        accountNumber: updatedAccount.accountNumber,
        accountName: updatedAccount.accountName,
        branch: updatedAccount.branch,
        // isPrimary field removed
        createdAt: updatedAccount.createdAt.toISOString(),
        updatedAt: updatedAccount.updatedAt.toISOString()
      },
      message: 'Cập nhật tài khoản ngân hàng thành công'
    });

  } catch (error) {
    console.error('Error updating bank account:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật tài khoản ngân hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xóa tài khoản ngân hàng' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if bank account exists and belongs to user
    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản ngân hàng' },
        { status: 404 }
      );
    }

    // Check if there are any pending withdrawals using this account
    const pendingWithdrawals = await prisma.withdrawal.findFirst({
      where: {
        bankAccountId: id,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (pendingWithdrawals) {
      return NextResponse.json(
        { error: 'Không thể xóa tài khoản ngân hàng có giao dịch rút tiền đang xử lý' },
        { status: 400 }
      );
    }

    // Delete bank account
    await prisma.bankAccount.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa tài khoản ngân hàng thành công'
    });

  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa tài khoản ngân hàng' },
      { status: 500 }
    );
  }
}
