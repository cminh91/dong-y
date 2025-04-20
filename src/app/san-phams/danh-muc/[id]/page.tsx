import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createProductSlug, toSlug } from '@/utils/stringUtils';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

const CategoryPage: FC<CategoryPageProps> = ({ params }) => {
  // Next.js 15+ dynamic API: unwrap params bằng React.use()
  const { id } = React.use(params);
  // Trong thực tế, dữ liệu này sẽ được lấy từ API dựa trên id
  // Ở đây chúng ta giả định danh mục từ slug tiếng Việt
  const categorySlug = id;
  
  // Chuyển đổi slug thành tên danh mục hiển thị (trong thực tế sẽ lấy từ database)
  const getCategoryNameFromSlug = (slug: string): string => {
    // Đây chỉ là ví dụ, trong thực tế sẽ lấy từ database
    const categories: {[key: string]: string} = {
      'thuoc-bo': 'Thuốc bổ',
      'thuoc-bo-gan': 'Thuốc bổ gan',
      'duoc-lieu': 'Dược liệu',
      'gia-vi-dong-y': 'Gia vị Đông y',
      'cham-soc-sac-dep': 'Chăm sóc sắc đẹp',
      'tra-thao-duoc': 'Trà thảo dược'
    };
    
    return categories[slug] || 'Danh mục không xác định';
  };
  
  const categoryName = getCategoryNameFromSlug(categorySlug);
  
  // Trong thực tế, dữ liệu này sẽ được lấy từ API dựa trên categorySlug
  const products = [
    {
      id: '1',
      name: 'Hoàng Liên Giải Độc Hoàn',
      image: 'https://images.unsplash.com/photo-1611485988300-b7ef6818e268?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      description: 'Giải độc gan, hỗ trợ điều trị viêm gan, vàng da',
      price: 320000,
      oldPrice: 380000,
      rating: 4.5,
      reviews: 120,
      category: 'Thuốc bổ gan'
    },
    {
      id: '2',
      name: 'Thập Toàn Đại Bổ Hoàn',
      image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      description: 'Tăng cường sức khỏe, bồi bổ cơ thể, chống suy nhược',
      price: 450000,
      oldPrice: 530000,
      rating: 5,
      reviews: 95,
      category: 'Thuốc bổ'
    },
    {
      id: '3',
      name: 'An Cung Ngưu Hoàng Hoàn',
      image: 'https://images.unsplash.com/photo-1542736667-069246bdbc6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      description: 'Phòng ngừa và hỗ trợ điều trị đột quỵ, tai biến mạch máu não',
      price: 580000,
      rating: 4,
      reviews: 78,
      category: 'Thuốc bổ'
    },
    {
      id: '4',
      name: 'Hà Thủ Ô Đỏ',
      image: 'https://images.unsplash.com/photo-1588940086836-36c7d89611a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      description: 'Bổ huyết, dưỡng can thận, đen tóc, chống lão hóa',
      price: 280000,
      rating: 4.5,
      reviews: 42,
      category: 'Dược liệu'
    }
  ];

  // Lọc sản phẩm theo danh mục (trong thực tế sẽ được thực hiện ở phía server hoặc API)
  const filteredProducts = categorySlug === 'tat-ca' 
    ? products 
    : products.filter(product => toSlug(product.category) === categorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link href="/san-phams" className="text-gray-600 hover:text-green-600">Sản phẩm</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">{categoryName}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
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
                <Link href={`/san-pham/${createProductSlug(product.name, product.id)}`} className="bg-white text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-green-500 hover:text-white transition-colors duration-300">
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Không tìm thấy sản phẩm nào trong danh mục này.</p>
          <Link href="/san-phams" className="btn-primary inline-block mt-4">
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;