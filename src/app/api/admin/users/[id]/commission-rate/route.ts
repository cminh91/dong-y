import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCommissionRateSchema = z.object({
  commissionRate: z.number().min(0).max(1) // 0 to 1 (0% to 100%)
});

// PUT /api/admin/users/[id]/commission-rate - Update user commission rate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { commissionRate } = updateCommissionRateSchema.parse(body);

    // Update user commission rate
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { commissionRate },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        commissionRate: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        commissionRate: Number(updatedUser.commissionRate),
        commissionRatePercent: Number(updatedUser.commissionRate * 100)
      },
      message: 'Commission rate updated successfully'
    });

  } catch (error) {
    console.error('Error updating commission rate:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid commission rate', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update commission rate' },
      { status: 500 }
    );
  }
}
