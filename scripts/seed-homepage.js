const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupHomepageData() {
  console.log('🧹 Dọn dẹp dữ liệu cũ...');
  
  try {
    // Xóa FAQs có category homepage
    const deletedFaqs = await prisma.fAQ.deleteMany({
      where: { category: 'homepage' }
    });

    // Xóa SystemSettings có category homepage
    const deletedSettings = await prisma.systemSetting.deleteMany({
      where: { category: 'homepage' }
    });

    console.log(`✅ Đã dọn dẹp: ${deletedFaqs.count} FAQs, ${deletedSettings.count} Settings`);
  } catch (error) {
    console.warn('⚠️ Lỗi khi dọn dẹp:', error.message);
  }
}

async function seedHomepageData(cleanup = false) {
  console.log('🌱 Bắt đầu seed dữ liệu trang chủ...');

  try {
    // Cleanup nếu được yêu cầu
    if (cleanup) {
      await cleanupHomepageData();
    }    // 1. Hero Section Data (Array format like JSON file)
    console.log('📝 Seeding Hero Section...');
    const heroSectionData = {
      key: 'hero_main',
      value: JSON.stringify([
        {
          id: "1",
          name: "HepaSaky",
          image: "/images/hepasaky.png",
          description: "HỖ TRỢ GIẢI ĐỘC GAN"
        },
        {
          id: "2", 
          name: "LipaSaky",
          image: "/images/lypasaky.png",
          description: "HỖ TRỢ GIẢM MỠ MÁU VÀ TĂNG SỨC BỀN THÀNH MẠCH"
        }
      ]),
      category: 'homepage',
      description: 'Hero section carousel data for homepage'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'hero_main' },
      update: heroSectionData,
      create: heroSectionData
    });// 2. About Section Data
    console.log('📝 Seeding About Section...');
    const aboutSectionData = {
      key: 'about_main',
      value: JSON.stringify({
        title: 'Về Chúng Tôi',
        subtitle: 'Hơn 20 năm kinh nghiệm trong lĩnh vực Đông Y',
        description: 'Chúng tôi tự hào là một trong những đơn vị hàng đầu trong lĩnh vực cung cấp thuốc Đông Y và thảo dược tự nhiên. Với đội ngũ chuyên gia giàu kinh nghiệm và quy trình sản xuất nghiêm ngặt, chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất cho khách hàng.',
        image: '/images/trongdong.png',
        stats: [
          { number: '20+', label: 'Năm kinh nghiệm' },
          { number: '10,000+', label: 'Khách hàng tin tưởng' },
          { number: '500+', label: 'Sản phẩm chất lượng' },
          { number: '50+', label: 'Chuyên gia tư vấn' }
        ],        features: [
          {
            title: 'Thảo dược tự nhiên',
            description: 'Tất cả sản phẩm đều được làm từ thảo dược tự nhiên 100%'
          },
          {
            title: 'Chứng nhận chất lượng',
            description: 'Được kiểm định bởi các tổ chức uy tín trong và ngoài nước'
          },
          {
            title: 'Đội ngũ chuyên gia',
            description: 'Chuyên gia Đông Y với nhiều năm kinh nghiệm tư vấn'
          },
          {
            title: 'Giao hàng nhanh chóng',
            description: 'Giao hàng toàn quốc trong 24-48h'
          }
        ]
      }),
      category: 'homepage',
      description: 'About section configuration for homepage'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'about_main' },
      update: aboutSectionData,
      create: aboutSectionData
    });    // 3. Benefits Section Data
    console.log('📝 Seeding Benefits Section...');
    const benefitsSectionData = {
      key: 'benefits_main',
      value: JSON.stringify({
        title: 'Lợi Ích Khi Chọn Chúng Tôi',
        subtitle: 'Cam kết mang đến sản phẩm và dịch vụ tốt nhất',        benefits: [
          {
            title: 'An toàn tuyệt đối',
            description: 'Tất cả sản phẩm đều được kiểm tra nghiêm ngặt về chất lượng và an toàn trước khi đến tay khách hàng.'
          },
          {
            title: 'Chất lượng cao',
            description: 'Sản phẩm được sản xuất theo tiêu chuẩn GMP với nguyên liệu thảo dược cao cấp.'
          },
          {
            title: 'Tư vấn chuyên nghiệp',
            description: 'Đội ngũ dược sĩ và bác sĩ Đông Y giàu kinh nghiệm luôn sẵn sàng tư vấn.'
          },
          {
            title: 'Giao hàng toàn quốc',
            description: 'Dịch vụ giao hàng nhanh chóng, đảm bảo sản phẩm đến tay khách hàng an toàn.'
          },
          {
            title: 'Giá cả hợp lý',
            description: 'Cam kết giá tốt nhất thị trường với nhiều chương trình khuyến mãi hấp dẫn.'
          },
          {
            title: 'Hỗ trợ 24/7',
            description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.'
          }
        ]
      }),
      category: 'homepage',
      description: 'Benefits section configuration for homepage'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'benefits_main' },
      update: benefitsSectionData,
      create: benefitsSectionData
    });    // 4. Testimonials Section Data
    console.log('📝 Seeding Testimonials Section...');
    const testimonialsData = {
      key: 'testimonials_main',
      value: JSON.stringify({
        title: 'Khách Hàng Nói Về Chúng Tôi',
        subtitle: 'Hàng nghìn khách hàng đã tin tưởng và lựa chọn sản phẩm của chúng tôi',
        testimonials: [
          {
            id: '1',
            name: 'Bà Nguyễn Thị Lan',
            location: 'TP. Hồ Chí Minh',
            avatar: '/images/placeholder.png',
            rating: 5,
            content: 'Tôi đã sử dụng sản phẩm HEPASAKY của cửa hàng được 3 tháng. Kết quả thật sự tuyệt vời, gan tôi đã khỏe hơn rất nhiều. Cảm ơn đội ngũ tư vấn nhiệt tình!',
            product: 'HEPASAKY GOLD'
          },
          {
            id: '2',
            name: 'Ông Trần Văn Minh',
            location: 'Hà Nội',
            avatar: '/images/placeholder.png',
            rating: 5,
            content: 'Lần đầu mua thuốc Đông y online nhưng rất hài lòng. Sản phẩm chất lượng, giao hàng nhanh, nhân viên tư vấn rất chuyên nghiệp. Tôi sẽ tiếp tục ủng hộ!',
            product: 'LYPASAKY'
          },
          {
            id: '3',
            name: 'Chị Phạm Thu Hương',
            location: 'Đà Nẵng',
            avatar: '/images/placeholder.png',
            rating: 5,
            content: 'Sau khi sinh con, cơ thể tôi rất yếu. Nhờ sử dụng các sản phẩm bổ dưỡng ở đây mà tôi đã phục hồi sức khỏe nhanh chóng. Rất cảm ơn!',
            product: 'Combo bổ dưỡng'
          },
          {
            id: '4',
            name: 'Anh Lê Hoàng Nam',
            location: 'Cần Thơ',
            avatar: '/images/placeholder.png',
            rating: 4,
            content: 'Tôi bị đau dạ dày mãn tính nhiều năm. Sau khi dùng thuốc Đông y tại đây được 2 tháng, tình trạng đã cải thiện đáng kể. Rất hài lòng với chất lượng sản phẩm.',
            product: 'Thuốc dạ dày'
          }
        ]
      }),
      category: 'homepage',
      description: 'Testimonials section configuration for homepage'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'testimonials_main' },
      update: testimonialsData,
      create: testimonialsData
    });

    // 5. Contact Section Data
    console.log('📝 Seeding Contact Section...');
    const contactSectionData = {
      key: 'contact_main',
      value: JSON.stringify({
        title: 'Liên Hệ Với Chúng Tôi',
        subtitle: 'Hãy để lại thông tin, chúng tôi sẽ liên hệ tư vấn miễn phí cho bạn.',        contactInfo: {
          address: {
            title: 'Địa chỉ',
            value: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh'
          },
          phone: {
            title: 'Điện thoại',
            value: '1900 1234'
          },
          email: {
            title: 'Email',
            value: 'info@dongypharmacy.com'
          },
          workingHours: {
            title: 'Giờ làm việc',
            value: 'Thứ 2 - Chủ nhật: 8:00 - 20:00'
          }
        },
        socialLinks: [
          { platform: 'Facebook', url: '#' },
          { platform: 'Twitter', url: '#' },
          { platform: 'Instagram', url: '#' },
          { platform: 'YouTube', url: '#' }
        ]}),      category: 'homepage',
      description: 'Contact section configuration for homepage'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'contact_main' },
      update: contactSectionData,
      create: contactSectionData
    });

    // 6. Website Configuration
    console.log('📝 Seeding Website Configuration...');
    const websiteConfigData = {
      key: 'website_config',
      value: JSON.stringify({
        siteName: 'DONGYHUYNH',
        siteTagline: 'Thương hiệu thuốc Đông Y uy tín',
        siteDescription: 'Chuyên cung cấp các sản phẩm thuốc Đông Y chất lượng cao, được bào chế từ những thảo dược quý hiếm theo phương pháp truyền thống.',
        logo: '/images/logo.jpg',
        favicon: '/favicon.ico',
        contactEmail: 'info@dongypharmacy.com',
        supportPhone: '1900 1234',
        businessHours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
        address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
        socialMedia: {
          facebook: 'https://facebook.com/dongyhuynh',
          youtube: 'https://youtube.com/dongyhuynh',
          zalo: 'https://zalo.me/dongyhuynh'
        },
        seo: {
          metaTitle: 'DONGYHUYNH - Thương hiệu thuốc Đông Y uy tín',
          metaDescription: 'Chuyên cung cấp các sản phẩm thuốc Đông Y chất lượng cao, thảo dược tự nhiên 100%. Tư vấn miễn phí từ chuyên gia.',
          metaKeywords: 'thuốc đông y, thảo dược, đông y huynh, hepasaky, lypasaky'
        }
      }),
      category: 'homepage',
      description: 'General website configuration'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'website_config' },
      update: websiteConfigData,
      create: websiteConfigData
    });

    // 7. Homepage Layout Settings
    console.log('📝 Seeding Homepage Layout...');
    const homepageLayoutData = {
      key: 'homepage_layout',
      value: JSON.stringify({
        sections: [
          { id: 'hero', name: 'Hero Section', enabled: true, order: 1 },
          { id: 'featured-products', name: 'Sản phẩm nổi bật', enabled: true, order: 2 },
          { id: 'about', name: 'Về chúng tôi', enabled: true, order: 3 },
          { id: 'benefits', name: 'Lợi ích', enabled: true, order: 4 },
          { id: 'testimonials', name: 'Nhận xét khách hàng', enabled: true, order: 5 },
          { id: 'recent-posts', name: 'Bài viết mới', enabled: true, order: 6 },
          { id: 'faqs', name: 'Câu hỏi thường gặp', enabled: true, order: 7 },
          { id: 'contact', name: 'Liên hệ', enabled: true, order: 8 }
        ],
        featuredProductsSettings: {
          title: 'Sản Phẩm Nổi Bật',
          subtitle: 'Những sản phẩm được khách hàng tin tùng và lựa chọn nhiều nhất',
          limit: 8,
          showPrice: true,
          showRating: true,
          layout: 'grid'
        },
        recentPostsSettings: {
          title: 'Tin Tức & Bài Viết',
          subtitle: 'Cập nhật những kiến thức mới nhất về Đông Y và sức khỏe',
          limit: 6,
          showExcerpt: true,
          showAuthor: true,
          showDate: true
        }
      }),
      category: 'homepage',
      description: 'Homepage sections layout and configuration'
    };

    await prisma.systemSetting.upsert({
      where: { key: 'homepage_layout' },
      update: homepageLayoutData,
      create: homepageLayoutData
    });

    // 8. Tạo sample FAQs
    console.log('📝 Seeding FAQs...');
      const faqs = [
      {
        question: 'Sản phẩm có được kiểm định chất lượng không?',
        answer: 'Tất cả sản phẩm của chúng tôi đều được kiểm định nghiêm ngặt theo tiêu chuẩn GMP và có giấy chứng nhận từ Bộ Y tế.',
        category: 'homepage',
        isActive: true,
        sortOrder: 1
      },
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Chúng tôi cam kết giao hàng trong vòng 24-48h tại TP.HCM và Hà Nội, 2-3 ngày cho các tỉnh thành khác.',
        category: 'homepage',
        isActive: true,
        sortOrder: 2
      },
      {
        question: 'Có tư vấn miễn phí không?',
        answer: 'Có, đội ngũ dược sĩ và bác sĩ Đông Y của chúng tôi luôn sẵn sàng tư vấn miễn phí 24/7.',
        category: 'homepage',
        isActive: true,
        sortOrder: 3
      },
      {
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng như mô tả.',
        category: 'homepage',
        isActive: true,
        sortOrder: 4
      },
      {
        question: 'Có hỗ trợ thanh toán COD không?',
        answer: 'Có, chúng tôi hỗ trợ thanh toán COD (thanh toán khi nhận hàng) trên toàn quốc.',
        category: 'homepage',
        isActive: true,
        sortOrder: 5
      }
    ];    for (const faq of faqs) {
      // Kiểm tra xem FAQ có tồn tại chưa dựa trên question
      const existingFaq = await prisma.fAQ.findFirst({
        where: { 
          question: faq.question,
          category: 'homepage'
        }
      });

      if (existingFaq) {
        // Cập nhật FAQ hiện có
        await prisma.fAQ.update({
          where: { id: existingFaq.id },
          data: faq
        });
      } else {
        // Tạo FAQ mới
        await prisma.fAQ.create({
          data: faq
        });
      }
    }console.log('✅ Seed dữ liệu trang chủ thành công!');
    console.log('📊 Đã tạo:');
    console.log('  - 7 System Settings:');
    console.log('    • Hero Section');
    console.log('    • About Section');
    console.log('    • Benefits Section');
    console.log('    • Testimonials Section');
    console.log('    • Contact Section');
    console.log('    • Website Configuration');
    console.log('    • Homepage Layout');
    console.log('  - 5 FAQs với category homepage');
    console.log('');
    console.log('🔧 Cách sử dụng:');
    console.log('  - Truy cập admin panel tại /admin/homepage để quản lý');
    console.log('  - API endpoints đã được tạo cho từng section');
    console.log('  - Dữ liệu được lưu trong SystemSetting và FAQ tables');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedHomepageData();
  } catch (error) {
    console.error('❌ Script seed thất bại:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main();
}

module.exports = { seedHomepageData };
