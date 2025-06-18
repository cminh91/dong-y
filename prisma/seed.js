// Load environment variables
require('dotenv').config({ path: '../.env' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const dongYCategory = await prisma.category.upsert({
    where: { slug: 'dong-y' },
    update: {},
    create: {
      name: 'Đông Y',
      slug: 'dong-y',
      description: 'Sản phẩm đông y truyền thống',
      image: '/images/danhmucbg.png',
      sortOrder: 1,
    },
  });

  const thucPhamCategory = await prisma.category.upsert({
    where: { slug: 'thuc-pham-chuc-nang' },
    update: {},
    create: {
      name: 'Thực phẩm chức năng',
      slug: 'thuc-pham-chuc-nang',
      description: 'Thực phẩm bổ sung dinh dưỡng',
      image: '/images/placeholder.png',
      sortOrder: 2,
    },
  });

  const duocLieuCategory = await prisma.category.upsert({
    where: { slug: 'duoc-lieu' },
    update: {},
    create: {
      name: 'Dược liệu',
      slug: 'duoc-lieu',
      description: 'Dược liệu thiên nhiên chất lượng cao',
      image: '/images/placeholder.png',
      sortOrder: 3,
    },
  });

  const chamSocSucKhoeCategory = await prisma.category.upsert({
    where: { slug: 'cham-soc-suc-khoe' },
    update: {},
    create: {
      name: 'Chăm sóc sức khỏe',
      slug: 'cham-soc-suc-khoe',
      description: 'Sản phẩm chăm sóc sức khỏe toàn diện',
      image: '/images/placeholder.png',
      sortOrder: 4,
    },
  });

  const myphamCategory = await prisma.category.upsert({
    where: { slug: 'my-pham-thien-nhien' },
    update: {},
    create: {
      name: 'Mỹ phẩm thiên nhiên',
      slug: 'my-pham-thien-nhien',
      description: 'Mỹ phẩm từ thiên nhiên an toàn',
      image: '/images/placeholder.png',
      sortOrder: 5,
    },
  });

  const traChamCategory = await prisma.category.upsert({
    where: { slug: 'tra-cham-soc-suc-khoe' },
    update: {},
    create: {
      name: 'Trà chăm sóc sức khỏe',
      slug: 'tra-cham-soc-suc-khoe',
      description: 'Các loại trà thảo dược tốt cho sức khỏe',
      image: '/images/placeholder.png',
      sortOrder: 6,
    },
  });

  const thietBiYTeCategory = await prisma.category.upsert({
    where: { slug: 'thiet-bi-y-te' },
    update: {},
    create: {
      name: 'Thiết bị y tế',
      slug: 'thiet-bi-y-te',
      description: 'Thiết bị y tế gia đình',
      image: '/images/placeholder.png',
      sortOrder: 7,
    },
  });

  console.log('✅ Categories created');

  // Create products
  const products = [
    // Sản phẩm Đông Y
    {
      name: 'Hepasaky',
      slug: 'hepasaky',
      description: 'Viên uống bổ gan Hepasaky - Hỗ trợ chức năng gan',
      content: '<p>Sản phẩm hỗ trợ bảo vệ và tăng cường chức năng gan từ thảo dược thiên nhiên.</p>',
      price: 250000,
      salePrice: 220000,
      sku: 'HEPASAKY-001',
      stock: 100,
      categoryId: dongYCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/hepasaky.png']),
    },
    {
      name: 'Lypasaky',
      slug: 'lypasaky',
      description: 'Viên uống giảm mỡ máu Lypasaky - Hỗ trợ tim mạch',
      content: '<p>Lypasaky giúp giảm cholesterol và mỡ máu, hỗ trợ tim mạch khỏe mạnh.</p>',
      price: 280000,
      salePrice: 250000,
      sku: 'LYPASAKY-001',
      stock: 100,
      categoryId: dongYCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/lypasaky.png']),
    },
    {
      name: 'Trọng Đông',
      slug: 'trong-dong',
      description: 'Viên uống Trọng Đông - Tăng cường sức khỏe nam giới',
      content: '<p>Trọng Đông hỗ trợ tăng cường sinh lực và sức khỏe nam giới từ thảo dược quý hiếm.</p>',
      price: 320000,
      sku: 'TRONGDONG-001',
      stock: 80,
      categoryId: dongYCategory.id,
      images: JSON.stringify(['/images/trongdong.png']),
    },
    {
      name: 'An Thần Định Chí',
      slug: 'an-than-dinh-chi',
      description: 'Viên uống An Thần Định Chí - Hỗ trợ giấc ngủ ngon',
      content: '<p>An Thần Định Chí giúp cải thiện giấc ngủ, giảm stress và lo âu từ thảo dược thiên nhiên.</p>',
      price: 180000,
      sku: 'ANTHANDI-001',
      stock: 120,
      categoryId: dongYCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Bổ Phế Thang',
      slug: 'bo-phe-thang',
      description: 'Viên uống Bổ Phế Thang - Hỗ trợ hệ hô hấp',
      content: '<p>Bổ Phế Thang hỗ trợ tăng cường chức năng phổi, cải thiện hệ hô hấp từ thảo dược thiên nhiên.</p>',
      price: 220000,
      sku: 'BOPHETHANG-001',
      stock: 90,
      categoryId: dongYCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Kiện Tỳ Hoàn',
      slug: 'kien-ty-hoan',
      description: 'Viên uống Kiện Tỳ Hoàn - Hỗ trợ tiêu hóa',
      content: '<p>Kiện Tỳ Hoàn hỗ trợ tăng cường chức năng tiêu hóa, cải thiện hấp thu dinh dưỡng.</p>',
      price: 160000,
      sku: 'KIENTYHOAN-001',
      stock: 110,
      categoryId: dongYCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Thực phẩm chức năng
    {
      name: 'Vitamin C 1000mg',
      slug: 'vitamin-c-1000mg',
      description: 'Viên uống Vitamin C 1000mg - Tăng cường miễn dịch',
      content: '<p>Vitamin C 1000mg giúp tăng cường hệ miễn dịch, chống oxy hóa và bảo vệ sức khỏe.</p>',
      price: 150000,
      sku: 'VITC-1000-001',
      stock: 200,
      categoryId: thucPhamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Omega 3 Fish Oil',
      slug: 'omega-3-fish-oil',
      description: 'Viên uống Omega 3 - Hỗ trợ tim mạch và não bộ',
      content: '<p>Omega 3 Fish Oil cung cấp EPA và DHA thiết yếu cho tim mạch và não bộ khỏe mạnh.</p>',
      price: 320000,
      sku: 'OMEGA3-001',
      stock: 150,
      categoryId: thucPhamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Collagen Marine Plus',
      slug: 'collagen-marine-plus',
      description: 'Viên uống Collagen Marine - Làm đẹp da từ bên trong',
      content: '<p>Collagen Marine Plus với collagen thủy phân giúp làm đẹp da, chống lão hóa hiệu quả.</p>',
      price: 450000,
      salePrice: 399000,
      sku: 'COLLAGEN-001',
      stock: 80,
      categoryId: thucPhamCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Calcium + D3',
      slug: 'calcium-d3',
      description: 'Viên uống Calcium + D3 - Bổ sung canxi cho xương khớp',
      content: '<p>Calcium + D3 cung cấp canxi và vitamin D3 cần thiết cho xương khớp chắc khỏe.</p>',
      price: 180000,
      sku: 'CALCIUM-D3-001',
      stock: 120,
      categoryId: thucPhamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Multivitamin Complete',
      slug: 'multivitamin-complete',
      description: 'Viên uống Multivitamin - Bổ sung vitamin tổng hợp',
      content: '<p>Multivitamin Complete cung cấp đầy đủ vitamin và khoáng chất cần thiết cho cơ thể.</p>',
      price: 200000,
      sku: 'MULTIVIT-001',
      stock: 100,
      categoryId: thucPhamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Probiotics 10 tỷ CFU',
      slug: 'probiotics-10-ty-cfu',
      description: 'Viên uống Probiotics - Hỗ trợ hệ tiêu hóa',
      content: '<p>Probiotics 10 tỷ CFU chứa các chủng vi khuẩn có lợi giúp cân bằng hệ vi sinh đường ruột.</p>',
      price: 280000,
      sku: 'PROBIOTICS-001',
      stock: 90,
      categoryId: thucPhamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Dược liệu
    {
      name: 'Nhân Sâm Tươi Hàn Quốc',
      slug: 'nhan-sam-tuoi-han-quoc',
      description: 'Nhân sâm tươi Hàn Quốc 6 năm tuổi - Bồi bổ sức khỏe',
      content: '<p>Nhân sâm tươi Hàn Quốc 6 năm tuổi chất lượng cao, bồi bổ sức khỏe và tăng cường sinh lực.</p>',
      price: 1200000,
      sku: 'GINSENG-KR-001',
      stock: 30,
      categoryId: duocLieuCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Đông Trùng Hạ Thảo Tây Tạng',
      slug: 'dong-trung-ha-thao-tay-tang',
      description: 'Đông trùng hạ thảo Tây Tạng - Dược liệu quý hiếm',
      content: '<p>Đông trùng hạ thảo Tây Tạng nguyên chất, dược liệu quý hiếm bồi bổ sức khỏe.</p>',
      price: 2500000,
      sku: 'CORDYCEPS-TB-001',
      stock: 15,
      categoryId: duocLieuCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Linh Chi Đỏ Hàn Quốc',
      slug: 'linh-chi-do-han-quoc',
      description: 'Linh chi đỏ Hàn Quốc - Tăng cường miễn dịch',
      content: '<p>Linh chi đỏ Hàn Quốc chất lượng cao, giúp tăng cường miễn dịch và chống lão hóa.</p>',
      price: 800000,
      sku: 'REISHI-KR-001',
      stock: 25,
      categoryId: duocLieuCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Saffron Iran Negin',
      slug: 'saffron-iran-negin',
      description: 'Saffron Iran Negin - Nhụy hoa nghệ tây cao cấp',
      content: '<p>Saffron Iran Negin nhụy hoa nghệ tây cao cấp.</p>',
      price: 1500000,
      sku: 'SAFFRON-IR-001',
      stock: 20,
      categoryId: duocLieuCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Yến Sào Khánh Hòa',
      slug: 'yen-sao-khanh-hoa',
      description: 'Yến sào Khánh Hòa - Bồi bổ sức khỏe cao cấp',
      content: '<p>Yến sào Khánh Hòa nguyên chất bồi bổ sức khỏe.</p>',
      price: 3000000,
      sku: 'YENSAO-KH-001',
      stock: 10,
      categoryId: duocLieuCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Trà chăm sóc sức khỏe
    {
      name: 'Trà Gừng Mật Ong',
      slug: 'tra-gung-mat-ong',
      description: 'Trà gừng mật ong - Ấm bụng, tăng cường miễn dịch',
      content: '<p>Trà gừng mật ong ấm bụng, hỗ trợ tiêu hóa.</p>',
      price: 120000,
      sku: 'TEA-GINGER-001',
      stock: 150,
      categoryId: traChamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Trà Atiso Đà Lạt',
      slug: 'tra-atiso-da-lat',
      description: 'Trà atiso Đà Lạt - Mát gan, giải độc',
      content: '<p>Trà atiso đà lạt giúp mát gan, giải độc.</p>',
      price: 80000,
      sku: 'TEA-ATISO-001',
      stock: 200,
      categoryId: traChamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Trà Hoa Cúc',
      slug: 'tra-hoa-cuc',
      description: 'Trà hoa cúc - Thanh nhiệt, giải độc',
      content: '<p>Trà hoa cúc thanh nhiệt, giải độc.</p>',
      price: 60000,
      sku: 'TEA-CHRYSAN-001',
      stock: 180,
      categoryId: traChamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Trà Ô Long Đài Loan',
      slug: 'tra-o-long-dai-loan',
      description: 'Trà Ô Long Đài Loan - Giảm cân, đẹp da',
      content: '<p>Trà Ô Long Đài Loan giảm cân, đẹp da.</p>',
      price: 200000,
      sku: 'TEA-OOLONG-001',
      stock: 100,
      categoryId: traChamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Thiết bị y tế
    {
      name: 'Máy Đo Huyết Áp Omron',
      slug: 'may-do-huyet-ap-omron',
      description: 'Máy đo huyết áp điện tử Omron - Chính xác và tiện lợi',
      content: '<p>Máy đo huyết áp điện tử Omron chính hãng, độ chính xác cao và dễ sử dụng.</p>',
      price: 1500000,
      salePrice: 1350000,
      sku: 'OMRON-BP-001',
      stock: 25,
      categoryId: thietBiYTeCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Máy Đo Đường Huyết Accu-Chek',
      slug: 'may-do-duong-huyet-accu-chek',
      description: 'Máy đo đường huyết Accu-Chek - Theo dõi đường huyết',
      content: '<p>Máy đo đường huyết Accu-Chek chính hãng từ Đức, kết quả nhanh chóng và chính xác.</p>',
      price: 800000,
      sku: 'ACCUCHEK-001',
      stock: 30,
      categoryId: thietBiYTeCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Nhiệt Kế Điện Tử Microlife',
      slug: 'nhiet-ke-dien-tu-microlife',
      description: 'Nhiệt kế điện tử Microlife - Đo nhiệt độ chính xác',
      content: '<p>Nhiệt kế điện tử hồng ngoại đo không tiếp xúc.</p>',
      price: 150000,
      sku: 'MICROLIFE-001',
      stock: 50,
      categoryId: thietBiYTeCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Mỹ phẩm thiên nhiên
    {
      name: 'Kem Dưỡng Da Nghệ Mật Ong',
      slug: 'kem-duong-da-nghe-mat-ong',
      description: 'Kem dưỡng da từ nghệ và mật ong - Làm sáng da tự nhiên',
      content: '<p>Kem dưỡng da từ lô hội thiên nhiên, giúp dưỡng ẩm và làm dịu da.</p>',
      price: 280000,
      sku: 'CREAM-TH-001',
      stock: 60,
      categoryId: myphamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Serum Vitamin C Thiên Nhiên',
      slug: 'serum-vitamin-c-thien-nhien',
      description: 'Serum Vitamin C từ thiên nhiên - Chống lão hóa',
      content: '<p>Serum vitamin C 20% chống lão hóa và làm sáng da.</p>',
      price: 350000,
      sku: 'SERUM-VITC-001',
      stock: 40,
      categoryId: myphamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Sữa Rửa Mặt Yến Mạch',
      slug: 'sua-rua-mat-yen-mach',
      description: 'Sữa rửa mặt yến mạch - Làm sạch dịu nhẹ',
      content: '<p>Sữa rửa mặt yến mạch làm sạch dịu nhẹ.</p>',
      price: 180000,
      sku: 'CLEANSER-OAT-001',
      stock: 80,
      categoryId: myphamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Mặt Nạ Đất Sét Biển Chết',
      slug: 'mat-na-dat-set-bien-chet',
      description: 'Mặt nạ đất sét Biển Chết - Thanh lọc da sâu',
      content: '<p>Mặt nạ đất sét Biển Chết thanh lọc da sâu.</p>',
      price: 220000,
      sku: 'MASK-CLAY-001',
      stock: 50,
      categoryId: myphamCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },

    // Chăm sóc sức khỏe
    {
      name: 'Dầu Massage Thảo Dược',
      slug: 'dau-massage-thao-duoc',
      description: 'Dầu massage thảo dược - Thư giãn cơ bắp',
      content: '<p>Dầu massage thảo dược thư giãn cơ bắp.</p>',
      price: 150000,
      sku: 'OIL-MASSAGE-001',
      stock: 70,
      categoryId: chamSocSucKhoeCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Miếng Dán Giảm Đau Salonpas',
      slug: 'mieng-dan-giam-dau-salonpas',
      description: 'Miếng dán giảm đau Salonpas - Giảm đau nhanh',
      content: '<p>Miếng dán giảm đau Salonpas giảm đau nhanh.</p>',
      price: 80000,
      sku: 'PATCH-PAIN-001',
      stock: 100,
      categoryId: chamSocSucKhoeCategory.id,
      images: JSON.stringify(['/images/placeholder.png']),
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
  }

  console.log('✅ Products created');

  // Create more products
  const productData = [
    {
      name: 'Sản phẩm test 1',
      slug: 'san-pham-test-1',
      description: 'Đây là sản phẩm test 1',
      content: '<p>Đây là nội dung sản phẩm test 1.</p>',
      price: 100000,
      salePrice: 90000,
      sku: 'SPTEST-001',
      stock: 50,
      categoryId: dongYCategory.id,
      isFeatured: false,
      images: JSON.stringify(['/images/placeholder.png']),
    },
    {
      name: 'Sản phẩm test 2',
      slug: 'san-pham-test-2',
      description: 'Đây là sản phẩm test 2',
      content: '<p>Đây là nội dung sản phẩm test 2.</p>',
      price: 200000,
      salePrice: 180000,
      sku: 'SPTEST-002',
      stock: 60,
      categoryId: thucPhamCategory.id,
      isFeatured: true,
      images: JSON.stringify(['/images/placeholder.png']),
    },
  ];

  for (const product of productData) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('✅ More products created');

  // Check final counts
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  
  console.log(`🎉 Seeding completed!`);
  console.log(`📊 Categories: ${categoryCount}`);
  console.log(`📦 Products: ${productCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });