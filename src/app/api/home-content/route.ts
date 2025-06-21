import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/home-content - Lấy tất cả nội dung trang chủ
export async function GET() {
  try {
    // Sử dụng SystemSetting để lưu trữ nội dung trang chủ
    const homeContent = await prisma.systemSetting.findMany({
      where: {
        category: 'home-content'
      },
      orderBy: {
        key: 'asc'
      }
    });

    // Transform data thành format dễ sử dụng
    const content = homeContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching home content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch home content' },
      { status: 500 }
    );
  }
}

// POST /api/home-content - Tạo hoặc cập nhật nội dung
export async function POST(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description,
        category: 'home-content'
      }
    });

    return NextResponse.json({
      success: true,
      data: setting
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating home content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update home content' },
      { status: 500 }
    );
  }
}
