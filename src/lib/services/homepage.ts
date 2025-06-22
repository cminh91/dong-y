import { prisma } from '@/lib/prisma';
import { Product, CategoryWithChildren, SystemSetting } from '@/types/api';

// Helper to make prisma types compatible with api types
function toApiSystemSetting(setting: any): SystemSetting | null {
    if (setting === null || typeof setting === 'undefined') return null;
    const { description, ...rest } = setting;
    return {
        ...rest,
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
    prisma.systemSetting.findFirst({ where: { key: 'home_category_products' } }),
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
  if (homeCategoryProductsSetting && typeof homeCategoryProductsSetting.value === 'string') {
    try {
      const categoryIds = JSON.parse(homeCategoryProductsSetting.value);
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
        featuredCategories = categories as any; // Cast to bypass strict type checking
      }
    } catch (e) {
      console.error("Failed to parse home_category_products", e);
    }
  }

  return {
    heroSection: toApiSystemSetting(heroSections.length > 0 ? heroSections[0] : null),
    aboutSection: toApiSystemSetting(aboutSections.length > 0 ? aboutSections[0] : null),
    testimonials: toApiSystemSettings(testimonials),
    benefits: toApiSystemSettings(benefits),
    featuredCategories,
    featuredProducts: (featuredProducts as any) || [],
  };
};