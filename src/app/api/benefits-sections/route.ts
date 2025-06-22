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
        createdAt: 'asc'
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

// POST /api/benefits-sections - Tạo benefit section mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const benefitSection = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category: 'benefits-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: benefitSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating benefit section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create benefit section' },
      { status: 500 }
    );
  }
}

// PUT /api/benefits-sections - Cập nhật benefit section
export async function PUT(req: NextRequest) {
  try {
    const { id, value } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    if (!value) {
        return NextResponse.json(
          { success: false, error: 'Value is required' },
          { status: 400 }
        );
      }

    const updatedSection = await prisma.systemSetting.update({
      where: { id },
      data: {
        value,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating benefit section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update benefit section' },
      { status: 500 }
    );
  }
}

// DELETE /api/benefits-sections - Xóa benefit section
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
      message: 'Benefit section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting benefit section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete benefit section' },
      { status: 500 }
    );
  }
}
