import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/benefits-sections - Lấy tất cả benefits sections
export async function GET() {
  try {
    const benefitsSections = await prisma.systemSetting.findMany({
      where: {
        category: 'benefits-section'
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: benefitsSections
    });
  } catch (error) {
    console.error('Error fetching benefits sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch benefits sections' },
      { status: 500 }
    );
  }
}

// POST /api/benefits-sections - Tạo benefits section mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const benefitsSection = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category: 'benefits-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: benefitsSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating benefits section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create benefits section' },
      { status: 500 }
    );
  }
}

// PUT /api/benefits-sections - Cập nhật benefits section
export async function PUT(req: NextRequest) {
  try {
    const { id, key, value, description } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const updatedSection = await prisma.systemSetting.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(value && { value }),
        ...(description !== undefined && { description }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating benefits section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update benefits section' },
      { status: 500 }
    );
  }
}

// DELETE /api/benefits-sections - Xóa benefits section
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.systemSetting.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Benefits section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting benefits section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete benefits section' },
      { status: 500 }
    );
  }
}
