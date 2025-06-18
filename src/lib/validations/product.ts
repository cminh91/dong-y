import { z } from 'zod';
import { ProductStatus } from '@/types/product';

// Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(255, 'Tên sản phẩm không được quá 255 ký tự'),
  slug: z.string().min(1, 'Slug là bắt buộc').max(255, 'Slug không được quá 255 ký tự'),
  description: z.string().optional(),
  content: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  salePrice: z.number().min(0, 'Giá khuyến mãi phải lớn hơn hoặc bằng 0').optional(),
  sku: z.string().max(100, 'SKU không được quá 100 ký tự').optional(),
  stock: z.number().int().min(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
  images: z.array(z.string().url('URL hình ảnh không hợp lệ')),
  categoryId: z.string().uuid('ID danh mục không hợp lệ'),
  isFeatured: z.boolean().default(false),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE)
});

// Product update schema
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid('ID sản phẩm không hợp lệ')
});

// Product query schema
export const productQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  featured: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Product slug schema
export const productSlugSchema = z.object({
  slug: z.string().min(1, 'Slug là bắt buộc')
});

// Validate price range
export const validatePriceRange = (minPrice?: number, maxPrice?: number) => {
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new Error('Giá tối thiểu không được lớn hơn giá tối đa');
  }
};

// Validate sale price
export const validateSalePrice = (price: number, salePrice?: number) => {
  if (salePrice !== undefined && salePrice >= price) {
    throw new Error('Giá khuyến mãi phải nhỏ hơn giá gốc');
  }
};