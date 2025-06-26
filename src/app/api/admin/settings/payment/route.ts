import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getUserPermissions } from '@/lib/permissions';

const paymentSettingSchema = z.object({
  // Bank transfer fields
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  branch: z.string().optional(),
  notes: z.string().optional(),
  qrImage: z.array(z.string()).optional(),
  // MoMo fields
  momoEnabled: z.boolean().default(false),
  momoPhoneNumber: z.string().optional(),
  momoAccountName: z.string().optional(),
  momoQrImage: z.array(z.string()).optional(),
});

// GET /api/admin/settings/payment
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Chỉ cho phép ADMIN truy cập
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ ADMIN mới có quyền xem thông tin này' },
        { status: 403 }
      );
    }

    const paymentSettings = await prisma.systemSetting.findFirst({
      where: {
        key: 'payment_settings',
        category: 'payment'
      }
    });

    return NextResponse.json({
      success: true,
      data: paymentSettings?.value || {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branch: '',
        notes: '',
        qrImage: [],
        // Default MoMo values
        momoEnabled: false,
        momoPhoneNumber: '',
        momoAccountName: '',
        momoQrImage: []
      }
    });

  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tải thông tin thanh toán' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/payment
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Chỉ cho phép ADMIN cập nhật
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ ADMIN mới có quyền cập nhật thông tin này' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Format data before validation
    const formattedData = {
      ...body,
      bankName: body.bankName?.trim(),
      accountNumber: body.accountNumber?.trim().replace(/\s+/g, ''),
      accountHolder: body.accountHolder?.trim().toUpperCase(),
      branch: body.branch?.trim() || '',
      notes: body.notes?.trim() || '',
      qrImage: body.qrImage || [],
      momoEnabled: body.momoEnabled === true,
      momoPhoneNumber: body.momoPhoneNumber?.trim() || '',
      momoAccountName: body.momoAccountName?.trim() || '',
      momoQrImage: body.momoQrImage || []
    };

    const validatedData = paymentSettingSchema.parse(formattedData);

    const updatedSettings = await prisma.systemSetting.upsert({
      where: {
        key: 'payment_settings'
      },
      create: {
        key: 'payment_settings',
        category: 'payment',
        value: validatedData,
        description: 'Cài đặt thông tin thanh toán ngân hàng và mã QR'
      },
      update: {
        value: validatedData
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings.value
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dữ liệu không hợp lệ', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thông tin thanh toán' },
      { status: 500 }
    );
  }
}
