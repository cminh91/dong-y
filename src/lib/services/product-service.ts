import { prisma } from '@/lib/prisma';
import { ProductWithCategory, ProductQueryParams, ProductsResponse } from '@/lib/types/product';

export class ProductService {
  /**
   * Get products with pagination, filtering, and sorting
   */
  static async getProducts(params: ProductQueryParams): Promise<ProductsResponse> {
    const {
      page = 1,
      limit = 12,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    // Category filter
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Featured filter
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
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

    // Execute queries
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Parse images from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    }));

    return {
      products: productsWithParsedImages as ProductWithCategory[],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    };
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: 'ACTIVE'
      },
      include: {
        category: true
      }
    });

    if (!product) return null;

    // Parse images from JSON string to array
    return {
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    } as ProductWithCategory;
  }

  /**
   * Get related products by category
   */
  static async getRelatedProducts(
    productId: string,
    categoryId: string,
    limit: number = 4
  ): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: {
          not: productId
        },
        status: 'ACTIVE'
      },
      include: {
        category: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse images from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    }));

    return productsWithParsedImages as ProductWithCategory[];
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        status: 'ACTIVE'
      },
      include: {
        category: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse images from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    }));

    return productsWithParsedImages as ProductWithCategory[];
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: string,
    limit?: number
  ): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        status: 'ACTIVE'
      },
      include: {
        category: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse images from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    }));

    return productsWithParsedImages as ProductWithCategory[];
  }

  /**
   * Search products
   */
  static async searchProducts(
    query: string,
    limit: number = 10
  ): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ],
        status: 'ACTIVE'
      },
      include: {
        category: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse images from JSON string to array
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    }));

    return productsWithParsedImages as ProductWithCategory[];
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<ProductWithCategory | null> {
    const product = await prisma.product.findUnique({
      where: {
        id,
        status: 'ACTIVE'
      },
      include: {
        category: true
      }
    });

    if (!product) return null;

    // Parse images from JSON string to array
    return {
      ...product,
      images: product.images ? JSON.parse(product.images as string) : []
    } as ProductWithCategory;
  }

  /**
   * Check if product exists
   */
  static async productExists(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: {
        id,
        status: 'ACTIVE'
      }
    });

    return count > 0;
  }

  /**
   * Get product stock
   */
  static async getProductStock(id: string): Promise<number> {
    const product = await prisma.product.findUnique({
      where: {
        id,
        status: 'ACTIVE'
      },
      select: {
        stock: true
      }
    });

    return product?.stock || 0;
  }

  /**
   * Update product stock
   */
  static async updateProductStock(id: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  }
}