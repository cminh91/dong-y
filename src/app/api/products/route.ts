import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter - only filter if status is provided
    if (status) {
      where.status = status;
      console.log('Filtering by status:', status);
    } else {
      console.log('No status filter applied - showing all products');
    }

    // Category filter
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Search filter (MySQL compatible with case-insensitive search)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } }
      ];
    }

    // Featured filter
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get products and total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Parse images and convert Decimal to number
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      content: product.content,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      sku: product.sku,
      stock: product.stock,
      images: product.images ? JSON.parse(product.images as string) : [],
      category: product.category,
      isFeatured: product.isFeatured,
      status: product.status,
      // NEW: Commission fields
      commissionRate: Number(product.commissionRate),
      commissionRatePercent: Number(product.commissionRate * 100),
      allowAffiliate: product.allowAffiliate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation (you might want more robust validation)
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, price, categoryId' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), // Generate slug if not provided
        description: body.description || '',
        content: body.content || '',
        price: parseFloat(body.price),
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        sku: body.sku || null,
        stock: body.stock ? parseInt(body.stock) : 0,
        images: body.images ? JSON.stringify(body.images) : '[]',
        categoryId: body.categoryId,
        isFeatured: body.isFeatured || false,
        status: body.status || 'published',
        commissionRate: body.commissionRate ? parseFloat(body.commissionRate) : 0,
        allowAffiliate: body.allowAffiliate || false,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}