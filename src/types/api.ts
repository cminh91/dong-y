// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Home Content Types
export interface HomeSettings {
  'hero-section': Record<string, any>;
  'about-section': Record<string, any>;
  'benefits-section': Record<string, any>;
  'testimonials-section': Record<string, any>;
  'contact-section': Record<string, any>;
  'home-content': Record<string, any>;
}

export interface HomepageData {
  settings: HomeSettings;
  featuredProducts?: Product[];
  categories?: CategoryWithChildren[];
  latestPosts?: PostWithRelations[];
  popularFaqs?: FAQ[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images?: any;
  categoryId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isFeatured: boolean;
  commissionRate: number;
  allowAffiliate: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
  _count: {
    products: number;
    children: number;
  };
  products?: Product[];
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorName: string;
  categoryId?: string;
  authorId?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithRelations extends Post {
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    fullName: string;
  };
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// System Setting Types
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface CreateHomeSettingRequest {
  key: string;
  value: any;
  description?: string;
}

export interface UpdateHomeSettingRequest {
  id: string;
  key?: string;
  value?: any;
  description?: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  content?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock?: number;
  images?: any;
  categoryId: string;
  commissionRate?: number;
  allowAffiliate?: boolean;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
  price?: number;
  salePrice?: number;
  sku?: string;
  stock?: number;
  images?: any;
  categoryId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isFeatured?: boolean;
  commissionRate?: number;
  allowAffiliate?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  authorName: string;
  categoryId?: string;
  authorId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
}

export interface UpdatePostRequest {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image?: string;
  authorName?: string;
  categoryId?: string;
  authorId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  sortOrder?: number;
}

export interface UpdateFAQRequest {
  id: string;
  question?: string;
  answer?: string;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface HomepageSettingsRequest {
  settings: Partial<HomeSettings>;
}

export interface HomepageSettingRequest {
  category: string;
  key: string;
  value: any;
  description?: string;
}
