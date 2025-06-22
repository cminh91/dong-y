const { PrismaClient } = require('@prisma/client');
const { seedHomepageData } = require('./seed-homepage');

const prisma = new PrismaClient();

async function resetAndSeedHomepage() {
  console.log('🧹 Bắt đầu xóa dữ liệu cũ và seed lại...');

  try {
    // Xóa dữ liệu cũ của trang chủ
    console.log('🗑️ Xóa dữ liệu cũ...');
    
    await prisma.systemSetting.deleteMany({
      where: {
        type: {
          in: ['HERO_SECTION', 'ABOUT_SECTION', 'BENEFITS_SECTION', 'TESTIMONIALS_SECTION', 'CONTACT_SECTION']
        }
      }
    });

    // Seed dữ liệu mới
    await seedHomepageData();
    
    console.log('✅ Reset và seed dữ liệu trang chủ thành công!');

  } catch (error) {
    console.error('❌ Lỗi khi reset và seed:', error);
    throw error;
  }
}

async function main() {
  try {
    await resetAndSeedHomepage();
  } catch (error) {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { resetAndSeedHomepage };
