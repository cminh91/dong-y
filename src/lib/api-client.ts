import { 
  ApiResponse, 
  HomepageData, 
  Product, 
  CategoryWithChildren, 
  PostWithRelations, 
  FAQ, 
  SystemSetting,
  CreateHomeSettingRequest,
  UpdateHomeSettingRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreatePostRequest,
  UpdatePostRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  HomepageSettingsRequest,
  HomepageSettingRequest
} from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Homepage Data APIs
  async getHomepageData(params: {
    includeProducts?: boolean;
    includeCategories?: boolean;
    includePosts?: boolean;
    includeFaqs?: boolean;
  } = {}): Promise<ApiResponse<HomepageData>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<HomepageData>(`/homepage-data?${searchParams}`);
  }

  async updateHomepageSettings(data: HomepageSettingsRequest): Promise<ApiResponse> {
    return this.request('/homepage-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHomepageSetting(data: HomepageSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/homepage-data', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Home Content APIs
  async getHomeContent(): Promise<ApiResponse<Record<string, any>>> {
    return this.request('/home-content');
  }

  async createHomeContent(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/home-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Hero Sections APIs
  async getHeroSections(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request('/hero-sections');
  }

  async createHeroSection(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/hero-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHeroSection(data: UpdateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/hero-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHeroSection(id: string): Promise<ApiResponse> {
    return this.request('/hero-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // About Sections APIs
  async getAboutSections(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request('/about-sections');
  }

  async createAboutSection(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/about-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAboutSection(data: UpdateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/about-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAboutSection(id: string): Promise<ApiResponse> {
    return this.request('/about-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Benefits Sections APIs
  async getBenefitsSections(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request('/benefits-sections');
  }

  async createBenefitsSection(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/benefits-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBenefitsSection(data: UpdateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/benefits-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBenefitsSection(id: string): Promise<ApiResponse> {
    return this.request('/benefits-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Testimonials APIs
  async getTestimonialsSections(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request('/testimonials-sections');
  }

  async createTestimonialsSection(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/testimonials-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTestimonialsSection(data: UpdateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/testimonials-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTestimonialsSection(id: string): Promise<ApiResponse> {
    return this.request('/testimonials-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Contact Sections APIs
  async getContactSections(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request('/contact-sections');
  }

  async createContactSection(data: CreateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/contact-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContactSection(data: UpdateHomeSettingRequest): Promise<ApiResponse<SystemSetting>> {
    return this.request<SystemSetting>('/contact-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContactSection(id: string): Promise<ApiResponse> {
    return this.request('/contact-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Featured Products APIs
  async getFeaturedProducts(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<Product[]>(`/featured-products-new?${searchParams}`);
  }

  async setFeaturedProduct(productId: string, isFeatured: boolean = true): Promise<ApiResponse<Product>> {
    return this.request<Product>('/featured-products-new', {
      method: 'POST',
      body: JSON.stringify({ productId, isFeatured }),
    });
  }

  async updateFeaturedProduct(data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return this.request<Product>('/featured-products-new', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeFeaturedProduct(productId: string): Promise<ApiResponse> {
    return this.request('/featured-products-new', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  }

  // Product Categories APIs
  async getProductCategories(params: {
    includeProducts?: boolean;
    parentId?: string;
    status?: string;
    rootOnly?: boolean;
    limit?: number;
  } = {}): Promise<ApiResponse<CategoryWithChildren[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<CategoryWithChildren[]>(`/product-categories-new?${searchParams}`);
  }

  async createProductCategory(data: CreateCategoryRequest): Promise<ApiResponse<CategoryWithChildren>> {
    return this.request<CategoryWithChildren>('/product-categories-new', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductCategory(data: UpdateCategoryRequest): Promise<ApiResponse<CategoryWithChildren>> {
    return this.request<CategoryWithChildren>('/product-categories-new', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductCategory(id: string): Promise<ApiResponse> {
    return this.request('/product-categories-new', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Posts APIs
  async getPostsSections(params: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    status?: string;
  } = {}): Promise<ApiResponse<PostWithRelations[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<PostWithRelations[]>(`/posts-sections?${searchParams}`);
  }

  async createPostSection(data: CreatePostRequest): Promise<ApiResponse<PostWithRelations>> {
    return this.request<PostWithRelations>('/posts-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePostSection(data: UpdatePostRequest): Promise<ApiResponse<PostWithRelations>> {
    return this.request<PostWithRelations>('/posts-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePostSection(id: string): Promise<ApiResponse> {
    return this.request('/posts-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // FAQs APIs
  async getFaqsSections(params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<FAQ[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<FAQ[]>(`/faqs-sections?${searchParams}`);
  }

  async createFaqSection(data: CreateFAQRequest): Promise<ApiResponse<FAQ>> {
    return this.request<FAQ>('/faqs-sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFaqSection(data: UpdateFAQRequest): Promise<ApiResponse<FAQ>> {
    return this.request<FAQ>('/faqs-sections', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFaqSection(id: string): Promise<ApiResponse> {
    return this.request('/faqs-sections', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }
}

export const apiClient = new ApiClient();
