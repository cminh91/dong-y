import { CategoryWithChildren, PostCategory, SystemSetting } from '@/types/api';

export interface LayoutData {
  productCategories: CategoryWithChildren[];
  postCategories: PostCategory[];
  contactInfo: SystemSetting | null;
}

export class LayoutService {
  private static cache: LayoutData | null = null;
  private static lastFetch: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getLayoutData(): Promise<LayoutData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const [productCategoriesRes, postCategoriesRes, contactInfoRes] = await Promise.all([
        fetch('/api/product-categories-new?includeChildren=true&status=ACTIVE'),
        fetch('/api/post-categories?status=ACTIVE'),
        fetch('/api/admin/contact-sections')
      ]);

      let productCategories: CategoryWithChildren[] = [];
      let postCategories: PostCategory[] = [];
      let contactInfo: SystemSetting | null = null;

      // Parse product categories
      if (productCategoriesRes.ok) {
        const productData = await productCategoriesRes.json();
        if (productData.success && productData.data) {
          productCategories = productData.data;
        }
      }

      // Parse post categories
      if (postCategoriesRes.ok) {
        const postData = await postCategoriesRes.json();
        if (postData.success && postData.data) {
          postCategories = postData.data;
        }
      }

      // Parse contact info - API /api/admin/contact-sections trả về object trực tiếp
      if (contactInfoRes.ok) {
        const contactData = await contactInfoRes.json();
        console.log('Contact API response:', contactData);

        // API trả về object trực tiếp như:
        // {"id":"...","address":"...","phone":"...","email":"...",...}
        if (contactData && contactData.id) {
          contactInfo = contactData;
          console.log('Contact info set to:', contactInfo);
        }
      } else {
        console.log('Contact API failed:', contactInfoRes.status, contactInfoRes.statusText);
      }

      this.cache = {
        productCategories,
        postCategories,
        contactInfo
      };
      this.lastFetch = now;

      return this.cache;
    } catch (error) {
      console.error('Error fetching layout data:', error);
      
      // Return empty data if fetch fails
      return {
        productCategories: [],
        postCategories: [],
        contactInfo: null
      };
    }
  }

  static clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}
