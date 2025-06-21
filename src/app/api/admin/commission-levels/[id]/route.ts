import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateLevelSchema = z.object({
  commissionRate: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET /api/admin/commission-levels/[id] - Get specific commission level
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const level = await prisma.commissionLevelSetting.findUnique({
      where: { id }
    });

    if (!level) {
      return NextResponse.json(
        { success: false, error: 'Commission level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...level,
        commissionRate: Number(level.commissionRate),
        commissionRatePercent: Number(level.commissionRate * 100)
      }
    });

  } catch (error) {
    console.error('Error fetching commission level:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission level' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/commission-levels/[id] - Update commission level
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLevelSchema.parse(body);

    const updatedLevel = await prisma.commissionLevelSetting.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedLevel,
        commissionRate: Number(updatedLevel.commissionRate),
        commissionRatePercent: Number(updatedLevel.commissionRate * 100)
      },
      message: 'Commission level updated successfully'
    });

  } catch (error) {
    console.error('Error updating commission level:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Commission level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update commission level' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/commission-levels/[id] - Delete commission level
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if level is being used in any commissions
    const commissionsUsingLevel = await prisma.commission.count({
      where: { level: { gt: 1 } } // Level commissions
    });

    if (commissionsUsingLevel > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete commission level that is being used in existing commissions. Set it to inactive instead.' 
        },
        { status: 400 }
      );
    }

    await prisma.commissionLevelSetting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Commission level deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting commission level:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Commission level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete commission level' },
      { status: 500 }
    );
  }
}
