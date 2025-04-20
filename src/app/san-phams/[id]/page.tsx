import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractIdFromSlug } from '@/utils/stringUtils';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const ProductPage: FC<ProductPageProps> = ({ params }) => {
  // Next.js 15+ dynamic API: unwrap params bằng React.use()
  const { id } = React.use(params);
  // Trích xuất ID từ slug tiếng Việt
  const productId = extractIdFromSlug(id);

  // Trong thực tế, dữ liệu này sẽ được lấy từ API dựa trên productId
  const product = {
    id: productId,
    name: 'Hoàng Liên Giải Độc Hoàn',
    image: '/images/hepasaky.png',
    description: 'Giải độc gan, hỗ trợ điều trị viêm gan, vàng da',
    longDescription: `
    Đối tượng sử dụng: 
- Người lớn có các triệu chứng mẩn ngứa, vàng da do 
chức năng gan kém, người bị suy giảm chức năng gan.
- Người uống nhiều rượi bia, tiếp xúc với hoá chất độc hại.
- Người đã bị nhiễm siêu vi B và siêu vi B mãn tính.
Cách dùng: Uống 2 viên/lần x 2 lần/ngày.
 Cảnh báo về sức khỏe: Không sử dụng cho phụ nữ có 
thai, đang cho con bú, người mẫn cảm, kiêng kỵ với bất kỳ
thành phần nào của sản phẩm. Người đang sử dụng thuốc 
cần tham khảo ý kiến chuyên gia y tế trước khi sử dụng.
 Chú ý: Thực phẩm này không phải là thuốc, không có 
tác dụng thay thế thuốc chữa bệnh.
 Bảo quản: Để nơi khô ráo, thoáng mát, tránh ánh sáng 
trực tiếp.
Để xa tầm tay của trẻ em.
 Hạn sử dụng: 36 tháng kể từ ngày sản xuất. Ngày sản 
xuất, hạn sử dụng xem trên bao bì.
Thành phần: Cho 1 viên nang cứng:
Cao khô Diệp hạ châu (Phyllanthus urinaria)..............100 mg
Cao khô Cà gai leo (Solanum procumbens)...............100 mg
Cao khô Kê cốt thảo (Abrus pulchellus).......................100 mg
Cao khô dứa dại (Pandanus tonkinensis).....................100 mg
Phụ liệu: Vỏ nang (gelatin), Chất độn (tinh bột bắp, latose), 
Chất chống đông vón (silicon dioxide, talc, magnesium 
stearate), Chất ổn định (Polyvinyl pyrrolidon K30).
Tỷ lệ chiết dược liệu thô: cao = 10:1
Công dụng: 
- Giải độc gan, hạn chế tổn thương tế bào gan do rượu, 
bia và các hoá chất độc hại gây nên.
- Hỗ trợ làm giảm các triệu chứng men gan cao, mẩn 
ngứa, vàng da, chán ăn, mệt mỏi do suy giảm chức năng 
gan.
    `,
    price: 320000,
    oldPrice: 380000,
    rating: 4.5,
    reviews: 120,
    stock: 50,
    category: 'Thuốc bổ gan'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh sản phẩm */}
        <div className="md:w-1/2">
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="md:w-1/2">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><Link href="/products" className="text-gray-600 hover:text-green-600">Sản phẩm</Link></li>
              <li><span className="mx-2">/</span></li>
              <li className="text-green-600">{product.name}</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => {
                if (i < Math.floor(product.rating)) {
                  return <i key={i} className="fas fa-star"></i>;
                } else if (i === Math.floor(product.rating) && product.rating % 1 !== 0) {
                  return <i key={i} className="fas fa-star-half-alt"></i>;
                } else {
                  return <i key={i} className="far fa-star"></i>;
                }
              })}
            </div>
            <span className="text-gray-500 ml-2">({product.reviews} đánh giá)</span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-green-700">
              {product.price.toLocaleString()}₫
            </span>
            {product.oldPrice && (
              <span className="text-gray-500 text-lg line-through ml-2">
                {product.oldPrice.toLocaleString()}₫
              </span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Mô tả ngắn:</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button className="px-4 py-2 text-xl">-</button>
                <input
                  type="number"
                  className="w-16 text-center border-x"
                  min="1"
                  max={product.stock}
                  defaultValue="1"
                />
                <button className="px-4 py-2 text-xl">+</button>
              </div>
              <span className="text-gray-500">Còn {product.stock} sản phẩm</span>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="btn-primary flex-1 py-3">
              <i className="fas fa-shopping-cart mr-2"></i>
              Thêm vào giỏ hàng
            </button>
            <button className="btn-secondary flex-1 py-3">
              Mua ngay
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết:</h2>
            <div className="prose prose-green">
              {product.longDescription.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;