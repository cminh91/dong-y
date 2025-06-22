import { FC } from 'react';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import ProductCategories from '@/components/home/ProductCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';
import { getHomePageData } from '@/lib/services/homepage';

const Home: FC = async () => {
  const homePageData = await getHomePageData();
  return (
    <>
      <div className="relative z-10">
        <main>
          <HeroSection data={homePageData.heroSection} />
          <AboutSection data={homePageData.aboutSection} />
          <BenefitsSection benefits={homePageData.benefits} />
          <ProductCategories categoriesData={homePageData.featuredCategories} />
          <FeaturedProducts productsData={homePageData.featuredProducts} />
          <TestimonialsSection data={homePageData.testimonials} />
          <ContactSection />
        </main>
      </div>
    </>
  );
};

export default Home;
