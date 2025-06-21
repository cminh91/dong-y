import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/faqs-sections - Lấy FAQ cho trang chủ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where: whereClause,
      orderBy: {
        sortOrder: 'asc'
      },
      take: limit,
      skip: offset
    });

    const total = await prisma.fAQ.count({
      where: whereClause
    });

    // Lấy danh sách categories
    const categories = await prisma.fAQ.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    return NextResponse.json({
      success: true,
      data: faqs,
      categories: categories.map(c => c.category),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// POST /api/faqs-sections - Tạo FAQ mới
export async function POST(req: NextRequest) {
  try {
    const { question, answer, category, sortOrder = 0 } = await req.json();

    if (!question || !answer || !category) {
      return NextResponse.json(
        { success: false, error: 'Question, answer, and category are required' },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        sortOrder,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: faq
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// PUT /api/faqs-sections - Cập nhật FAQ
export async function PUT(req: NextRequest) {
  try {
    const { id, question, answer, category, isActive, sortOrder } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const updatedFaq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedFaq
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE /api/faqs-sections - Xóa FAQ
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    await prisma.fAQ.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
