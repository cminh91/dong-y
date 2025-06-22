import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/about-sections - Lấy tất cả about sections
export async function GET() {
  try {
    const aboutSections = await prisma.systemSetting.findMany({
      where: {
        category: 'about-section'
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: aboutSections
    });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about sections' },
      { status: 500 }
    );
  }
}

// POST /api/about-sections - Tạo about section mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const aboutSection = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category: 'about-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: aboutSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating about section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create about section' },
      { status: 500 }
    );
  }
}

// PUT /api/about-sections - Cập nhật about section
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
    console.error('Error updating about section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update about section' },
      { status: 500 }
    );
  }
}

// DELETE /api/about-sections - Xóa about section
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
      message: 'About section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting about section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete about section' },
      { status: 500 }
    );
  }
}
