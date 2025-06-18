import { Category } from '@prisma/client';

// Category with product count
export interface CategoryWithProductCount extends Category {
  productCount?: number;
}

// Category for frontend display
export interface CategoryDisplay {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category creation data
export interface CategoryCreateData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// Category update data
export interface CategoryUpdateData extends Partial<CategoryCreateData> {
  id: string;
}

// Category filters
export interface CategoryFilters {
  search?: string;
  hasProducts?: boolean;
}

// Category list response
export interface CategoryListResponse {
  categories: CategoryWithProductCount[];
}