import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createProductSlug, toSlug } from '@/utils/stringUtils';

interface ProductProps {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  category: string;
}

const ProductsPage: FC = () => {
  // Trong thực tế, dữ liệu này sẽ được lấy từ API
  const products: ProductProps[] = [
    {
      id: '1',
      name: 'LypaSaky',
      image: '/images/lypasaky.png',
      description: 'Giải độc gan, hỗ trợ điều trị viêm gan, vàng da',
      price: 320000,
      oldPrice: 380000,
      rating: 4.5,
      reviews: 120,
      category: 'Thuốc bổ gan'
    },
    {
      id: '2',
      name: 'HepaSaky',
      image: '/images/hepasaky.png',
      description: 'Tăng cường sức khỏe, bồi bổ cơ thể, chống suy nhược',
      price: 450000,
      oldPrice: 530000,
      rating: 5,
      reviews: 95,
      category: 'Thuốc bổ'
    },
    // Thêm các sản phẩm khác...
  ];

  const categories = [
    'Tất cả',
    'Thuốc bổ',
    'Thuốc bổ gan',
    'Dược liệu',
    'Gia vị Đông y',
    'Chăm sóc sắc đẹp',
    'Trà thảo dược'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar lọc */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Lọc sản phẩm</h2>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <Link
                      href={index === 0 ? "/san-phams" : `/san-phams/${toSlug(category)}`}
                      className="ml-2 hover:text-green-600"
                    >
                      {category}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Giá</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    className="form-radio text-green-600"
                    defaultChecked
                  />
                  <span className="ml-2">Tất cả</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">Dưới 300.000₫</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">300.000₫ - 500.000₫</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">Trên 500.000₫</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Đánh giá</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      className="form-radio text-green-600"
                      defaultChecked={rating === 5}
                    />
                    <span className="ml-2 flex items-center">
                      {[...Array(rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400"></i>
                      ))}
                      {[...Array(5 - rating)].map((_, i) => (
                        <i key={i} className="far fa-star text-yellow-400"></i>
                      ))}
                      <span className="ml-1">trở lên</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>
            <select className="form-select border rounded-lg px-4 py-2">
              <option>Mới nhất</option>
              <option>Giá thấp đến cao</option>
              <option>Giá cao đến thấp</option>
              <option>Đánh giá cao nhất</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="card group">
                <div className="relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                    width={300}
                    height={250}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/san-phams/${createProductSlug(product.name, product.id)}`} className="bg-white text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-green-500 hover:text-white transition-colors duration-300">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
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
                    <span className="text-gray-500 text-sm ml-2">({product.reviews} đánh giá)</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-green-700">{product.price.toLocaleString()}₫</span>
                      {product.oldPrice && <span className="text-gray-500 text-sm line-through ml-2">{product.oldPrice.toLocaleString()}₫</span>}
                    </div>
                    <button className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-700 hover:text-white transition-colors duration-300">
                      <i className="fas fa-shopping-cart"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-lg border hover:bg-green-50" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white">1</button>
              <button className="px-4 py-2 rounded-lg border hover:bg-green-50">2</button>
              <button className="px-4 py-2 rounded-lg border hover:bg-green-50">3</button>
              <button className="px-3 py-2 rounded-lg border hover:bg-green-50">
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;