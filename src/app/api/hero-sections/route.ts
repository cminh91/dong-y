import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hero-sections - Lấy tất cả hero sections
export async function GET() {
  try {    const heroSections = await prisma.systemSetting.findMany({
      where: {
        OR: [
          { category: 'hero-section' },
          { 
            category: 'homepage',
            key: 'hero_main'
          }
        ]
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSections
    });
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero sections' },
      { status: 500 }
    );
  }
}

// POST /api/hero-sections - Tạo hero section mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Kiểm tra key đã tồn tại chưa
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key }
    });

    if (existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Key already exists' },
        { status: 409 }
      );
    }

    const heroSection = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
        category: 'hero-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hero section' },
      { status: 500 }
    );
  }
}

// PUT /api/hero-sections - Cập nhật hero section
export async function PUT(req: NextRequest) {
  try {
    const { id, key, value, description } = await req.json();

    if (!id && !key) {
      return NextResponse.json(
        { success: false, error: 'ID or key is required' },
        { status: 400 }
      );
    }

    let updatedSection;
    // Ensure value is stored as a string if it's an object/array
    const valueAsString = (value && typeof value === 'object') ? JSON.stringify(value) : value;
    
    if (key) {
      // Update by key (for hero_main)
      updatedSection = await prisma.systemSetting.upsert({
        where: { key },
        update: {
          ...(valueAsString !== undefined && { value: valueAsString }),
          ...(description !== undefined && { description }),
          updatedAt: new Date()
        },
        create: {
          key,
          value: valueAsString || '[]',
          description: description || 'Hero section data',
          category: 'homepage'
        }
      });
    } else {
      // Update by id
      updatedSection = await prisma.systemSetting.update({
        where: { id },
        data: {
          ...(key && { key }),
          ...(valueAsString !== undefined && { value: valueAsString }),
          ...(description !== undefined && { description }),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-sections - Xóa hero section
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
      message: 'Hero section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hero section' },
      { status: 500 }
    );
  }
}
