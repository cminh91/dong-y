import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutPage: FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">Giới thiệu</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="bg-green-50 rounded-xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">CÔNG TY TNHH THƯƠNG MẠI KND</h1>
            <p className="text-xl text-gray-600 mb-6">Kết hợp tinh hoa y học cổ truyền với công nghệ hiện đại</p>
            <p className="text-gray-600 mb-6">Chúng tôi cam kết mang đến những sản phẩm thuốc đông y chất lượng cao, được nghiên cứu kỹ lưỡng và sản xuất theo tiêu chuẩn nghiêm ngặt, giúp cải thiện sức khỏe và nâng cao chất lượng cuộc sống của người tiêu dùng.</p>
          </div>
          <div className="md:w-1/2">
            <Image 
              src="/images/lypasaky.png" 
              alt="Phòng nghiên cứu Đông Y Pharmacy" 
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Câu chuyện của chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Image 
              src="/images/hepasaky.png" 
              alt="Cửa hàng Đông Y Pharmacy" 
              width={500}
              height={350}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Lịch sử hình thành</h3>
            <p className="text-gray-600 mb-4">Đông Y Pharmacy được thành lập vào năm 2010 bởi Tiến sĩ Nguyễn Văn A - một chuyên gia hàng đầu trong lĩnh vực y học cổ truyền với hơn 30 năm kinh nghiệm.</p>
            <p className="text-gray-600 mb-4">Xuất phát từ tâm huyết muốn phát triển và bảo tồn những bài thuốc quý từ y học cổ truyền Việt Nam, Đông Y Pharmacy đã không ngừng nghiên cứu và phát triển để tạo ra những sản phẩm thuốc đông y chất lượng cao, kết hợp giữa tinh hoa y học cổ truyền và công nghệ hiện đại.</p>
            <p className="text-gray-600">Trải qua hơn 12 năm phát triển, Đông Y Pharmacy đã trở thành một trong những thương hiệu uy tín hàng đầu trong lĩnh vực thuốc đông y tại Việt Nam, với hệ thống phân phối rộng khắp cả nước và được hàng ngàn khách hàng tin tưởng sử dụng.</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mb-16 bg-green-50 p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Sứ mệnh</h3>
            <p className="text-gray-600 mb-4">Chúng tôi cam kết nghiên cứu, phát triển và cung cấp các sản phẩm thuốc đông y chất lượng cao, an toàn và hiệu quả, góp phần cải thiện sức khỏe và nâng cao chất lượng cuộc sống của người tiêu dùng.</p>
            <p className="text-gray-600">Đồng thời, chúng tôi mong muốn bảo tồn và phát huy những giá trị quý báu của y học cổ truyền Việt Nam, kết hợp với khoa học hiện đại để tạo ra những sản phẩm thuốc đông y tiên tiến.</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">Tầm nhìn</h3>
            <p className="text-gray-600 mb-4">Trở thành thương hiệu thuốc đông y hàng đầu tại Việt Nam và vươn tầm quốc tế, được khách hàng tin tưởng và lựa chọn.</p>
            <p className="text-gray-600">Xây dựng một hệ sinh thái y học cổ truyền toàn diện, từ nghiên cứu, sản xuất đến phân phối và tư vấn sức khỏe, mang lại giá trị bền vững cho khách hàng, đối tác và cộng đồng.</p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Giá trị cốt lõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-leaf text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">Chất lượng</h3>
            <p className="text-gray-600">Cam kết cung cấp sản phẩm chất lượng cao, được nghiên cứu kỹ lưỡng và sản xuất theo tiêu chuẩn nghiêm ngặt.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-flask text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">Đổi mới</h3>
            <p className="text-gray-600">Không ngừng nghiên cứu và phát triển để tạo ra những sản phẩm mới, kết hợp giữa y học cổ truyền và công nghệ hiện đại.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-heart text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">Tận tâm</h3>
            <p className="text-gray-600">Luôn đặt lợi ích và sức khỏe của khách hàng lên hàng đầu, tận tâm phục vụ và tư vấn để mang lại giá trị tốt nhất.</p>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Đội ngũ chuyên gia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Image 
              src="/images/hepasaky.png" 
              alt="TS. Nguyễn Văn A" 
              width={200}
              height={200}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-1 text-primary">TS. Nguyễn Văn A</h3>
            <p className="text-gray-500 mb-3">Nhà sáng lập, Giám đốc nghiên cứu</p>
            <p className="text-gray-600 mb-4">Hơn 30 năm kinh nghiệm trong lĩnh vực y học cổ truyền, tốt nghiệp Tiến sĩ Y học tại Đại học Y Hà Nội.</p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Image 
              src="/images/lypasaky.png" 
              alt="ThS. Trần Thị B" 
              width={200}
              height={200}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-1 text-primary">ThS. Trần Thị B</h3>
            <p className="text-gray-500 mb-3">Giám đốc sản xuất</p>
            <p className="text-gray-600 mb-4">Hơn 15 năm kinh nghiệm trong lĩnh vực sản xuất dược phẩm, tốt nghiệp Thạc sĩ Dược học tại Đại học Dược Hà Nội.</p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Image 
              src="/images/trongdong.png" 
              alt="DS. Lê Văn C" 
              width={200}
              height={200}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-1 text-primary">DS. Lê Văn C</h3>
            <p className="text-gray-500 mb-3">Trưởng phòng kiểm nghiệm</p>
            <p className="text-gray-600 mb-4">Hơn 10 năm kinh nghiệm trong lĩnh vực kiểm nghiệm dược phẩm, tốt nghiệp Dược sĩ tại Đại học Y Dược TP.HCM.</p>
            <div className="flex justify-center space-x-3">
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-primary"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="mb-16 bg-green-50 p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Chứng nhận & Giải thưởng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-certificate text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-2 text-primary">GMP</h3>
            <p className="text-gray-600">Chứng nhận Thực hành sản xuất thuốc tốt</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-award text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-2 text-primary">ISO 9001:2015</h3>
            <p className="text-gray-600">Chứng nhận Hệ thống quản lý chất lượng</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-medal text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-2 text-primary">Thương hiệu uy tín</h3>
            <p className="text-gray-600">Top 10 thương hiệu đông y uy tín 2022</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trophy text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-2 text-primary">Sản phẩm chất lượng cao</h3>
            <p className="text-gray-600">Giải thưởng sản phẩm chất lượng cao 2023</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Hãy trải nghiệm sản phẩm của chúng tôi</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">Khám phá các sản phẩm thuốc đông y chất lượng cao, được nghiên cứu kỹ lưỡng và sản xuất theo tiêu chuẩn nghiêm ngặt.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/products" className="bg-white text-primary font-medium py-3 px-6 rounded-full hover:bg-gray-100 transition-colors">
            Xem sản phẩm
          </Link>
          <Link href="/contact" className="bg-transparent border-2 border-white text-white font-medium py-3 px-6 rounded-full hover:bg-white hover:text-primary transition-colors">
            Liên hệ với chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;