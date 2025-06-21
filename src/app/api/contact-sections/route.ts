import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contact-sections - Lấy tất cả contact sections
export async function GET() {
  try {
    const contactSections = await prisma.systemSetting.findMany({
      where: {
        category: 'contact-section'
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: contactSections
    });
  } catch (error) {
    console.error('Error fetching contact sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact sections' },
      { status: 500 }
    );
  }
}

// POST /api/contact-sections - Tạo contact section mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const contactSection = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category: 'contact-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: contactSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact section' },
      { status: 500 }
    );
  }
}

// PUT /api/contact-sections - Cập nhật contact section
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
    console.error('Error updating contact section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact section' },
      { status: 500 }
    );
  }
}

// DELETE /api/contact-sections - Xóa contact section
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
      message: 'Contact section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact section' },
      { status: 500 }
    );
  }
}
