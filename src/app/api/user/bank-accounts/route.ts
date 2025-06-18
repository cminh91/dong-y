import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bank account creation/update
const bankAccountSchema = z.object({
  bankName: z.enum(['VIETCOMBANK', 'VIETINBANK', 'BIDV', 'AGRIBANK', 'TECHCOMBANK', 'MBBANK', 'TPBANK']),
  accountNumber: z.string().min(1, 'Số tài khoản không được để trống'),
  accountName: z.string().min(1, 'Tên chủ tài khoản không được để trống'),
  branch: z.string().min(1, 'Chi nhánh không được để trống'),
  isPrimary: z.boolean().optional().default(false)
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem tài khoản ngân hàng' },
        { status: 401 }
      );
    }

    // Get user's bank accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform data for frontend
    const transformedAccounts = bankAccounts.map(account => ({
      id: account.id,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      branch: account.branch,
      isPrimary: account.isPrimary,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      bankAccounts: transformedAccounts
    });

  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải danh sách tài khoản ngân hàng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thêm tài khoản ngân hàng' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = bankAccountSchema.parse(body);

    // Check if account number already exists for this user
    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        accountNumber: validatedData.accountNumber,
        bankName: validatedData.bankName
      }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Tài khoản ngân hàng này đã tồn tại' },
        { status: 400 }
      );
    }

    // If this is set as primary, update other accounts
    if (validatedData.isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      });
    }

    // Create new bank account
    const newBankAccount = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        bankName: validatedData.bankName,
        accountNumber: validatedData.accountNumber,
        accountName: validatedData.accountName,
        branch: validatedData.branch,
        isPrimary: validatedData.isPrimary
      }
    });

    return NextResponse.json({
      success: true,
      bankAccount: {
        id: newBankAccount.id,
        bankName: newBankAccount.bankName,
        accountNumber: newBankAccount.accountNumber,
        accountName: newBankAccount.accountName,
        branch: newBankAccount.branch,
        isPrimary: newBankAccount.isPrimary,
        createdAt: newBankAccount.createdAt.toISOString(),
        updatedAt: newBankAccount.updatedAt.toISOString()
      },
      message: 'Thêm tài khoản ngân hàng thành công'
    });

  } catch (error) {
    console.error('Error creating bank account:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi thêm tài khoản ngân hàng' },
      { status: 500 }
    );
  }
}
