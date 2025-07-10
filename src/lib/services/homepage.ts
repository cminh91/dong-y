import { prisma } from '@/lib/prisma';
import { Product, CategoryWithChildren, SystemSetting } from '@/types/api';

// Helper to make prisma types compatible with api types
function toApiSystemSetting(setting: any): SystemSetting | null {
    if (setting === null || typeof setting === 'undefined') return null;
    const { description, ...rest } = setting;

    // Parse JSON string in value field if it's a string
    let parsedValue = rest.value;
    if (typeof rest.value === 'string') {
        try {
            parsedValue = JSON.parse(rest.value);
        } catch (e) {
            ////console.log('Failed to parse value as JSON, keeping as string:', rest.value);
            // Keep as string if parsing fails
        }
    }

    return {
        ...rest,
        value: parsedValue,
        description: description === null ? undefined : description,
    };
}

function toApiSystemSettings(settings: any[]): SystemSetting[] {
    if (!Array.isArray(settings)) return [];
    return settings.map(s => toApiSystemSetting(s!)).filter(Boolean) as SystemSetting[];
}

export interface HomePageData {
  heroSection: SystemSetting | null;
  aboutSection: SystemSetting | null;
  testimonials: SystemSetting[];
  benefits: SystemSetting[];
  featuredCategories: CategoryWithChildren[];
  featuredProducts: Product[];
}

export const getHomePageData = async (): Promise<HomePageData> => {
  const [
    heroSections,
    aboutSections,
    testimonials,
    benefits,
    homeCategoryProductsSetting,
    featuredProducts,
  ] = await Promise.all([
    prisma.systemSetting.findMany({
      where: {
        OR: [{ category: 'hero-section' }, { category: 'homepage', key: 'hero_main' }],
      },
      orderBy: { key: 'asc' },
    }),
    prisma.systemSetting.findMany({ where: { category: 'about-section' } }),
    prisma.systemSetting.findMany({ where: { category: 'testimonials-section' } }),
    prisma.systemSetting.findMany({ where: { category: 'benefits-section' } }),
    prisma.systemSetting.findFirst({ where: { key: 'featured_home_categories' } }),
    prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
      take: 8,
      include: {
        category: true,
      },
       orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  let featuredCategories: CategoryWithChildren[] = [];
  //console.log('homeCategoryProductsSetting:', homeCategoryProductsSetting);

  if (homeCategoryProductsSetting) {
    try {
      let categoryIds: string[] = [];

      // Handle both string and array values
      if (typeof homeCategoryProductsSetting.value === 'string') {
        categoryIds = JSON.parse(homeCategoryProductsSetting.value);
      } else if (Array.isArray(homeCategoryProductsSetting.value)) {
        categoryIds = homeCategoryProductsSetting.value.filter((id): id is string => typeof id === 'string');
      }

      //console.log('Parsed categoryIds:', categoryIds);

      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        const categories = await prisma.category.findMany({
          where: {
            id: { in: categoryIds },
            status: 'ACTIVE',
          },
          include: {
            children: {
              where: { status: 'ACTIVE' },
            },
          },
        });
        //console.log('categories from prisma in homepage.ts', categories);
        featuredCategories = categories as any; // Cast to bypass strict type checking
      }
    } catch (e) {
      console.error("Failed to parse featured_home_categories", e);
    }
  }

  // Process featured products to ensure proper format
  const processedFeaturedProducts = featuredProducts.map(product => {
    // Create a new object with only the fields we need
    return {
      id: product.id,
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      content: product.content,
      images: typeof product.images === 'string' ? product.images : '[]',
      price: Number(product.price) || 0,
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      status: product.status,
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Convert all Decimal fields to number
      commissionRate: product.commissionRate ? Number(product.commissionRate) : 0,
      stock: product.stock ? Number(product.stock) : 0,
      allowAffiliate: product.allowAffiliate || false,
      // Add missing fields for Product type
      sku: '', // Add default SKU
    };
  });


  return {
    heroSection: toApiSystemSetting(heroSections.length > 0 ? heroSections[0] : null),
    aboutSection: toApiSystemSetting(aboutSections.length > 0 ? aboutSections[0] : null),
    testimonials: toApiSystemSettings(testimonials),
    benefits: toApiSystemSettings(benefits),
    featuredCategories,
    featuredProducts: processedFeaturedProducts as Product[],
  };
};