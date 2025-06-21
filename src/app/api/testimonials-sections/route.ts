import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/testimonials-sections - Lấy tất cả testimonials
export async function GET() {
  try {
    const testimonials = await prisma.systemSetting.findMany({
      where: {
        category: 'testimonials-section'
      },
      orderBy: {
        key: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials-sections - Tạo testimonial mới
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Validate testimonial data structure
    const testimonialData = value;
    if (!testimonialData.name || !testimonialData.testimonial) {
      return NextResponse.json(
        { success: false, error: 'Name and testimonial content are required' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.systemSetting.create({
      data: {
        key,
        value: testimonialData,
        description,
        category: 'testimonials-section'
      }
    });

    return NextResponse.json({
      success: true,
      data: testimonial
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// PUT /api/testimonials-sections - Cập nhật testimonial
export async function PUT(req: NextRequest) {
  try {
    const { id, key, value, description } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const updatedTestimonial = await prisma.systemSetting.update({
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
      data: updatedTestimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials-sections - Xóa testimonial
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
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
