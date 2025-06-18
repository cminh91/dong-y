import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';
import { toSlug } from '@/utils/stringUtils';

interface ProductProps {
  id: string;
  name: string;
  image: string;
  description: string;
  longDescription: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
}

interface ProductCardProps extends ProductProps {
  reverse?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({ id, name, image, description, price, oldPrice, rating, reviews, badge, reverse }) => {
  return (
    <Link href={`/san-pham/${toSlug(name)}`} className={`group flex ${reverse ? 'flex-col md:flex-row-reverse md:text-right md:justify-end' : 'flex-col md:flex-row'} items-center md:items-center gap-4 rounded-lg overflow-hidden shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-4`}>
      <div className="relative overflow-hidden flex-shrink-0 w-full md:w-80">
        <Image
          src={image}
          alt={name}
          className="w-full h-full object-contain"
          width={300}
          height={250}
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <div className={`flex items-center mb-2 ${reverse ? 'md:justify-end md:text-right' : ''}`}>
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => {
              if (i < Math.floor(rating)) {
                return <i key={i} className="fas fa-star"></i>;
              } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                return <i key={i} className="fas fa-star-half-alt"></i>;
              } else {
                return <i key={i} className="far fa-star"></i>;
              }
            })}
          </div>
          <span className="text-gray-500 text-sm ml-2">({reviews} đánh giá)</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className={`flex items-center justify-between ${reverse ? 'md:justify-end md:text-right' : ''}`}>
          <div>
            <span className="font-bold text-green-700">{price?.toLocaleString() || '0'}₫</span>
            {oldPrice && <span className="text-gray-500 text-sm line-through ml-2">{oldPrice?.toLocaleString() || '0'}₫</span>}
          </div>
         
        </div>
        <button className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-700 hover:text-white transition-colors duration-300">
            <i className="fas fa-shopping-cart"></i>
          </button>
      </div>
    </Link>
  );
};

const FeaturedProducts: FC = () => {
  const products: ProductProps[] = [
    {
      id: '1',
      name: 'HEPASAKY GOLD',
      image: '/images/hepasaky.png',
      description: 'Giải độc gan, hỗ trợ điều trị viêm gan, vàng da',
      longDescription: 'Sản phẩm được bào chế từ các thảo dược quý giúp thanh lọc cơ thể, tăng cường chức năng gan, hỗ trợ điều trị các bệnh về gan hiệu quả.',
      price: 320000,
      rating: 4.5,
      reviews: 120,
      badge: 'Best Seller'
    },
    {
      id: '2',
      name: 'LYPASAKY',
      image: '/images/lypasaky.png',
      description: 'Tăng cường sức khỏe, bồi bổ cơ thể, chống suy nhược',
      longDescription: 'Bổ khí huyết, tăng cường thể lực, giúp ăn ngon ngủ tốt, phục hồi sức khỏe cho người mới ốm dậy hoặc suy nhược cơ thể.',
      price: 450000,
      oldPrice: 530000,
      rating: 5,
      reviews: 95,
      badge: '-15%'
    },
  ];

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sản Phẩm Nổi Bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Khám phá các sản phẩm thuốc đông y chất lượng cao từ các thảo dược tự nhiên, được chế biến theo công thức cổ truyền kết hợp công nghệ hiện đại.</p>
        </div>
        
        <div className="flex flex-col gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              {...product}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/san-pham" className="btn-primary inline-flex items-center">
            Xem tất cả sản phẩm
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;