import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FEATURED_HOME_CATEGORIES_KEY = 'featured_home_categories';

// GET /api/home-category-products - Lấy danh sách ID danh mục nổi bật
export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: FEATURED_HOME_CATEGORIES_KEY },
    });

    if (!setting || !Array.isArray(setting.value)) {
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    console.error('Error fetching featured home categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured categories' },
      { status: 500 }
    );
  }
}

// POST /api/home-category-products - Cập nhật danh sách ID danh mục nổi bật
export async function POST(req: NextRequest) {
  try {
    const { categoryIds } = await req.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, error: 'categoryIds must be an array' },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: FEATURED_HOME_CATEGORIES_KEY },
      update: { value: categoryIds },
      create: {
        key: FEATURED_HOME_CATEGORIES_KEY,
        value: categoryIds,
        description: 'Danh sách ID các danh mục sản phẩm nổi bật trên trang chủ',
        category: 'homepage',
      },
    });

    return NextResponse.json({ success: true, data: updatedSetting });
  } catch (error) {
    console.error('Error updating featured home categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update featured categories' },
      { status: 500 }
    );
  }
}