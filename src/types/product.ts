import { Product, Category } from '@prisma/client';

// Product with category information
export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// Serialized product for client components (Decimal converted to number)
export interface SerializedProductWithCategory extends Omit<Product, 'price' | 'salePrice'> {
  price: number;
  salePrice: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// Product filters for API
export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

// Product sort options
export interface ProductSort {
  field: 'name' | 'price' | 'createdAt';
  order: 'asc' | 'desc';
}

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Pagination result
export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// Product list response
export interface ProductListResponse {
  products: ProductWithCategory[];
  pagination: PaginationResult;
}

// Product status enum
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

// Product for frontend display
export interface ProductDisplay {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Product creation data
export interface ProductCreateData {
  name: string;
  slug: string;
  description?: string;
  content?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  images: string[];
  categoryId: string;
  isFeatured?: boolean;
  status?: ProductStatus;
}

// Product update data
export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}