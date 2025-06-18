const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const samplePosts = [
  {
    title: 'Lợi ích của Đông y trong điều trị bệnh gan',
    slug: 'loi-ich-dong-y-dieu-tri-benh-gan',
    content: `
      <h2>Đông y và điều trị bệnh gan</h2>
      <p>Y học cổ truyền Đông y đã có hàng nghìn năm kinh nghiệm trong việc điều trị các bệnh về gan. Với triết lý "phòng bệnh hơn chữa bệnh", Đông y tập trung vào việc cân bằng âm dương trong cơ thể.</p>
      
      <h3>Các phương pháp điều trị chính:</h3>
      <ul>
        <li><strong>Dùng thảo dược:</strong> Các vị thuốc như cam thảo, bạch truật, đương quy giúp bổ gan, thanh nhiệt</li>
        <li><strong>Châm cứu:</strong> Kích thích các huyệt đạo liên quan đến gan</li>
        <li><strong>Điều chỉnh chế độ ăn:</strong> Tránh thức ăn nhiều dầu mỡ, cay nóng</li>
        <li><strong>Luyện tập khí công:</strong> Giúp lưu thông khí huyết</li>
      </ul>
      
      <h3>Ưu điểm của phương pháp Đông y:</h3>
      <p>Điều trị từ gốc, ít tác dụng phụ, phù hợp với cơ địa người Việt. Tuy nhiên, cần kết hợp với y học hiện đại để đạt hiệu quả tốt nhất.</p>
      
      <blockquote>
        <p>"Gan là tạng chủ về sự dẻo dai, nếu gan khỏe thì cơ thể sẽ dẻo dai, linh hoạt" - Hoàng Đế Nội Kinh</p>
      </blockquote>
    `,
    excerpt: 'Khám phá những lợi ích tuyệt vời của y học cổ truyền Đông y trong việc điều trị và phòng ngừa các bệnh về gan một cách tự nhiên và hiệu quả.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    authorName: 'BS. Nguyễn Văn Minh',
    publishedAt: new Date('2024-01-15')
  },
  {
    title: 'Top 10 thảo dược tăng cường hệ miễn dịch',
    slug: 'top-10-thao-duoc-tang-cuong-he-mien-dich',
    content: `
      <h2>Những thảo dược quý giúp tăng cường sức đề kháng</h2>
      <p>Hệ miễn dịch là lá chắn bảo vệ cơ thể khỏi các tác nhân gây bệnh. Dưới đây là 10 loại thảo dược được chứng minh có tác dụng tăng cường hệ miễn dịch:</p>
      
      <h3>1. Nhân sâm (Panax ginseng)</h3>
      <p>Được mệnh danh là "vua của các loại thảo dược", nhân sâm có tác dụng bổ khí, tăng cường thể lực và sức đề kháng.</p>
      
      <h3>2. Linh chi (Ganoderma lucidum)</h3>
      <p>Nấm linh chi chứa nhiều polysaccharide và triterpene, giúp điều hòa hệ miễn dịch và chống oxy hóa.</p>
      
      <h3>3. Đông trùng hạ thảo</h3>
      <p>Loại nấm quý hiếm này có tác dụng bổ phổi, tăng cường sức khỏe hô hấp và miễn dịch.</p>
      
      <h3>4. Cam thảo (Glycyrrhiza glabra)</h3>
      <p>Có tính kháng viêm, kháng virus tự nhiên, thường được dùng trong các bài thuốc tăng cường miễn dịch.</p>
      
      <h3>5. Hoàng kỳ (Astragalus membranaceus)</h3>
      <p>Thảo dược này giúp tăng cường chức năng của tế bào miễn dịch và chống lão hóa.</p>
      
      <h3>Cách sử dụng an toàn:</h3>
      <ul>
        <li>Tham khảo ý kiến bác sĩ trước khi sử dụng</li>
        <li>Bắt đầu với liều nhỏ để kiểm tra phản ứng</li>
        <li>Kết hợp với chế độ ăn uống và tập luyện hợp lý</li>
      </ul>
    `,
    excerpt: 'Danh sách 10 loại thảo dược quý giúp nâng cao sức đề kháng và bảo vệ cơ thể khỏi bệnh tật một cách tự nhiên.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    authorName: 'Dược sĩ Trần Thị Lan',
    publishedAt: new Date('2024-01-10')
  },
  {
    title: 'Phương pháp điều trị mất ngủ bằng Đông y',
    slug: 'phuong-phap-dieu-tri-mat-ngu-bang-dong-y',
    content: `
      <h2>Giải pháp tự nhiên cho giấc ngủ ngon</h2>
      <p>Mất ngủ là vấn đề phổ biến trong cuộc sống hiện đại. Đông y có nhiều phương pháp hiệu quả để điều trị tình trạng này mà không gây tác dụng phụ.</p>
      
      <h3>Nguyên nhân mất ngủ theo Đông y:</h3>
      <ul>
        <li><strong>Tâm thận không giao:</strong> Do stress, lo âu quá mức</li>
        <li><strong>Gan khí ứ trệ:</strong> Cảm xúc bị dồn nén</li>
        <li><strong>Tỳ vị hư yếu:</strong> Tiêu hóa kém, ăn uống không điều độ</li>
        <li><strong>Âm huyết bất족:</strong> Thiếu máu, suy nhược cơ thể</li>
      </ul>
      
      <h3>Các bài thuốc điều trị:</h3>
      
      <h4>1. Cam Mạch Đại Táo Thang</h4>
      <p>Thành phần: Cam thảo, đại táo, tiểu mạch. Có tác dụng an thần, dưỡng tâm.</p>
      
      <h4>2. An Thần Định Chí Hoàn</h4>
      <p>Bài thuốc cổ phương giúp an thần, điều trị mất ngủ do lo âu, stress.</p>
      
      <h3>Phương pháp hỗ trợ khác:</h3>
      <ul>
        <li><strong>Massage huyệt đạo:</strong> Ấn huyệt Thần Môn, Ấn Đường, Bách Hội</li>
        <li><strong>Ngâm chân:</strong> Dùng nước ấm có thêm muối hoặc thảo dược</li>
        <li><strong>Thiền định:</strong> Luyện tập thở sâu, thư giãn tinh thần</li>
        <li><strong>Điều chỉnh sinh hoạt:</strong> Đi ngủ đúng giờ, tránh caffeine buổi tối</li>
      </ul>
      
      <h3>Lưu ý quan trọng:</h3>
      <p>Nếu tình trạng mất ngủ kéo dài, nên tham khảo ý kiến bác sĩ để có phương án điều trị phù hợp.</p>
    `,
    excerpt: 'Giải pháp an toàn và hiệu quả từ Đông y giúp cải thiện chất lượng giấc ngủ một cách tự nhiên, không gây tác dụng phụ.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    authorName: 'ThS.BS Lê Văn Hùng',
    publishedAt: new Date('2024-01-05')
  },
  {
    title: 'Cách chăm sóc sức khỏe trong mùa đông theo Đông y',
    slug: 'cach-cham-soc-suc-khoe-mua-dong-dong-y',
    content: `
      <h2>Bí quyết giữ gìn sức khỏe mùa đông</h2>
      <p>Mùa đông là thời điểm cơ thể cần được chăm sóc đặc biệt. Theo Đông y, đây là mùa của thận, cần tập trung bồi bổ thận khí.</p>
      
      <h3>Nguyên tắc chăm sóc sức khỏe mùa đông:</h3>
      
      <h4>1. Giữ ấm cơ thể</h4>
      <ul>
        <li>Mặc đủ ấm, đặc biệt chú ý giữ ấm vùng lưng, bụng</li>
        <li>Đeo khăn quàng cổ để bảo vệ huyệt Phong Phủ</li>
        <li>Ngâm chân nước ấm trước khi ngủ</li>
      </ul>
      
      <h4>2. Điều chỉnh chế độ ăn uống</h4>
      <ul>
        <li><strong>Nên ăn:</strong> Thực phẩm ấm tính như gừng, quế, thịt cừu, hạt óc chó</li>
        <li><strong>Hạn chế:</strong> Thức ăn lạnh, trái cây nhiều nước</li>
        <li><strong>Bổ sung:</strong> Súp, cháo, trà thảo dược ấm</li>
      </ul>
      
      <h4>3. Tập luyện phù hợp</h4>
      <p>Nên tập luyện nhẹ nhàng như thái cực quyền, khí công. Tránh vận động mạnh vào buổi sáng sớm khi trời lạnh.</p>
      
      <h4>4. Điều chỉnh tinh thần</h4>
      <p>Mùa đông dễ sinh ra cảm giác u sầu. Cần duy trì tinh thần lạc quan, tham gia các hoạt động xã hội.</p>
      
      <h3>Các bài thuốc bồi bổ mùa đông:</h3>
      
      <h4>Thang thuốc bổ thận:</h4>
      <p>Thành phần: Thục địa, sơn thù, đơn bì, trạch tả, phục linh, quế chi. Giúp bổ thận dương, tăng cường sức khỏe.</p>
      
      <h4>Trà gừng mật ong:</h4>
      <p>Pha trà gừng tươi với mật ong, uống ấm giúp tăng cường miễn dịch và giữ ấm cơ thể.</p>
      
      <h3>Lời khuyên từ chuyên gia:</h3>
      <blockquote>
        <p>"Mùa đông tàng tinh, xuân sinh phát" - Cần tích trữ năng lượng trong mùa đông để chuẩn bị cho sự phát triển của mùa xuân.</p>
      </blockquote>
    `,
    excerpt: 'Những lời khuyên và phương pháp từ Đông y giúp bạn và gia đình khỏe mạnh trong những ngày giá lạnh của mùa đông.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
    status: 'PUBLISHED',
    authorName: 'BS. Phạm Thị Mai',
    publishedAt: new Date('2024-01-01')
  },
  {
    title: 'Bài thuốc Đông y chữa ho khan hiệu quả',
    slug: 'bai-thuoc-dong-y-chua-ho-khan-hieu-qua',
    content: `
      <h2>Điều trị ho khan bằng thảo dược tự nhiên</h2>
      <p>Ho khan là triệu chứng phổ biến, đặc biệt vào mùa khô hanh. Đông y có nhiều bài thuốc hiệu quả để điều trị tình trạng này.</p>
      
      <h3>Phân loại ho khan theo Đông y:</h3>
      
      <h4>1. Ho do phổi nhiệt</h4>
      <p><strong>Triệu chứng:</strong> Ho khan, khạc đờm ít, miệng khô, họng đau</p>
      <p><strong>Điều trị:</strong> Thanh phổi nhuận táo</p>
      
      <h4>2. Ho do phổi âm hư</h4>
      <p><strong>Triệu chứng:</strong> Ho khan kéo dài, đờm ít, mệt mỏi</p>
      <p><strong>Điều trị:</strong> Bổ âm nhuận phổi</p>
      
      <h3>Các bài thuốc điều trị:</h3>
      
      <h4>Bài thuốc 1: Cam Lộ Ẩm</h4>
      <p><strong>Thành phần:</strong></p>
      <ul>
        <li>Thiên môn đông 15g</li>
        <li>Mạch môn đông 15g</li>
        <li>Sa sâm 10g</li>
        <li>Cam thảo 6g</li>
        <li>Lô hội 3g</li>
      </ul>
      <p><strong>Cách dùng:</strong> Sắc nước, uống ấm 2 lần/ngày</p>
      
      <h4>Bài thuốc 2: Bách Hợp Cố Kim Thang</h4>
      <p><strong>Thành phần:</strong></p>
      <ul>
        <li>Bách hợp 20g</li>
        <li>Sinh địa 15g</li>
        <li>Thục địa 15g</li>
        <li>Mạch môn đông 12g</li>
        <li>Đương quy 10g</li>
        <li>Bạch thược 10g</li>
        <li>Cam thảo 6g</li>
      </ul>
      
      <h3>Phương pháp hỗ trợ:</h3>
      
      <h4>1. Massage huyệt đạo</h4>
      <ul>
        <li><strong>Huyệt Phế Du:</strong> Massage nhẹ nhàng 2-3 phút</li>
        <li><strong>Huyệt Thiên Đột:</strong> Ấn nhẹ khi ho</li>
        <li><strong>Huyệt Thái Uyên:</strong> Massage để giảm ho</li>
      </ul>
      
      <h4>2. Thực phẩm hỗ trợ</h4>
      <ul>
        <li>Lê nấu với mật ong</li>
        <li>Nước cam thảo</li>
        <li>Trà hoa cúc</li>
        <li>Cháo bạch hợp</li>
      </ul>
      
      <h3>Lưu ý khi sử dụng:</h3>
      <ul>
        <li>Tránh thức ăn cay nóng, khô hanh</li>
        <li>Uống nhiều nước, giữ ẩm cho cổ họng</li>
        <li>Nếu ho kéo dài quá 2 tuần, nên đi khám bác sĩ</li>
      </ul>
    `,
    excerpt: 'Các bài thuốc Đông y truyền thống giúp điều trị ho khan hiệu quả, an toàn và không gây tác dụng phụ.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    status: 'DRAFT',
    authorName: 'Lương y Nguyễn Văn Đức',
    publishedAt: null
  }
];

const generateSamplePost = (index) => ({
  title: `Bài viết demo ${index + 1}`,
  slug: `bai-viet-demo-${index + 1}`,
  content: `Nội dung bài viết demo ${index + 1}`,
  excerpt: `Mô tả ngắn bài viết demo ${index + 1}`,
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
  status: 'PUBLISHED',
  authorName: 'Người dùng demo',
  publishedAt: new Date()
});

for (let i = 0; i < 4; i++) {
  samplePosts.push(generateSamplePost(samplePosts.length));
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu bài viết...');

  // Xóa dữ liệu cũ (nếu có)
  await prisma.post.deleteMany({});
  console.log('🗑️  Đã xóa dữ liệu bài viết cũ');

  // Thêm bài viết mẫu
  for (const post of samplePosts) {
    const createdPost = await prisma.post.create({
      data: post
    });
    console.log(`✅ Đã tạo bài viết: ${createdPost.title}`);
  }

  console.log('🎉 Hoàn thành seed dữ liệu bài viết!');
  console.log(`📊 Tổng cộng: ${samplePosts.length} bài viết`);
  console.log(`📝 Đã đăng: ${samplePosts.filter(p => p.status === 'PUBLISHED').length} bài`);
  console.log(`📋 Nháp: ${samplePosts.filter(p => p.status === 'DRAFT').length} bài`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
