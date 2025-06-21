import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/homepage-data - Lấy tất cả dữ liệu cho trang chủ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') !== 'false';
    const includeCategories = searchParams.get('includeCategories') !== 'false';
    const includePosts = searchParams.get('includePosts') !== 'false';
    const includeFaqs = searchParams.get('includeFaqs') !== 'false';

    // Lấy tất cả settings cho trang chủ
    const homeSettings = await prisma.systemSetting.findMany({
      where: {
        category: {
          in: ['home-content', 'hero-section', 'about-section', 'benefits-section', 'testimonials-section', 'contact-section']
        }
      },
      orderBy: {
        category: 'asc'
      }
    });

    // Nhóm settings theo category
    const settingsByCategory = homeSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    const result: any = {
      success: true,
      data: {
        settings: settingsByCategory
      }
    };

    // Lấy sản phẩm nổi bật
    if (includeProducts) {
      const featuredProducts = await prisma.product.findMany({
        where: {
          isFeatured: true,
          status: 'ACTIVE'
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 8
      });
      result.data.featuredProducts = featuredProducts;
    }

    // Lấy danh mục sản phẩm
    if (includeCategories) {
      const categories = await prisma.category.findMany({
        where: {
          status: 'ACTIVE',
          parentId: null // Chỉ lấy danh mục gốc
        },
        include: {
          children: {
            where: { status: 'ACTIVE' },
            orderBy: { sortOrder: 'asc' },
            take: 5
          },
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: { sortOrder: 'asc' },
        take: 8
      });
      result.data.categories = categories;
    }

    // Lấy bài viết mới nhất
    if (includePosts) {
      const latestPosts = await prisma.post.findMany({
        where: {
          status: 'PUBLISHED'
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              id: true,
              fullName: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: 6
      });
      result.data.latestPosts = latestPosts;
    }

    // Lấy FAQs phổ biến
    if (includeFaqs) {
      const popularFaqs = await prisma.fAQ.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          sortOrder: 'asc'
        },
        take: 8
      });
      result.data.popularFaqs = popularFaqs;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}

// POST /api/homepage-data - Cập nhật nhiều settings cùng lúc
export async function POST(req: NextRequest) {
  try {
    const { settings } = await req.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const updates = [];

    // Duyệt qua từng category và key để cập nhật
    for (const [category, categorySettings] of Object.entries(settings)) {
      if (typeof categorySettings === 'object') {
        for (const [key, value] of Object.entries(categorySettings as Record<string, any>)) {
          updates.push(
            prisma.systemSetting.upsert({
              where: { key: `${category}_${key}` },
              update: {
                value,
                updatedAt: new Date()
              },
              create: {
                key: `${category}_${key}`,
                value,
                category,
                description: `Setting for ${category} - ${key}`
              }
            })
          );
        }
      }
    }

    // Thực hiện tất cả updates
    const results = await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} settings`,
      data: results
    });
  } catch (error) {
    console.error('Error updating homepage settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage settings' },
      { status: 500 }
    );
  }
}

// PUT /api/homepage-data - Cập nhật một setting cụ thể
export async function PUT(req: NextRequest) {
  try {
    const { category, key, value, description } = await req.json();

    if (!category || !key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Category, key, and value are required' },
        { status: 400 }
      );
    }

    const settingKey = `${category}_${key}`;

    const setting = await prisma.systemSetting.upsert({
      where: { key: settingKey },
      update: {
        value,
        description,
        updatedAt: new Date()
      },
      create: {
        key: settingKey,
        value,
        description: description || `Setting for ${category} - ${key}`,
        category
      }
    });

    return NextResponse.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}
