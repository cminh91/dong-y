import { z } from 'zod';

// Category creation schema
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc').max(255, 'Tên danh mục không được quá 255 ký tự'),
  slug: z.string().min(1, 'Slug là bắt buộc').max(255, 'Slug không được quá 255 ký tự'),
  description: z.string().optional(),
  image: z.string().url('URL hình ảnh không hợp lệ').optional()
});

// Category update schema
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid('ID danh mục không hợp lệ')
});

// Category query schema
export const categoryQuerySchema = z.object({
  includeProductCount: z.string().optional().default('false'),
  search: z.string().optional(),
  hasProducts: z.string().optional()
});

// Category slug schema
export const categorySlugSchema = z.object({
  slug: z.string().min(1, 'Slug là bắt buộc')
});