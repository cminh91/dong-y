import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';
import { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  reverse?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({ product, reverse }) => {
  const { name, images, description, price, salePrice, slug } = product;

  // Debug logging
  //console.log('ProductCard - Product:', name, 'Images:', images, 'Type:', typeof images);

  const getImageUrl = (): string => {
    if (!images) {
      return '/images/placeholder.png';
    }

    //console.log('Processing images:', images, 'Type:', typeof images);

    let imageUrls: string[] = [];

    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        //console.log('Parsed images:', parsed, 'Is Array:', Array.isArray(parsed));

        if (Array.isArray(parsed)) {
          // Extract valid URLs from the array
          imageUrls = parsed
            .filter(item => typeof item === 'string' && item.trim() !== '')
            .map(item => item.trim());
        } else if (typeof parsed === 'string' && parsed.trim() !== '') {
          imageUrls = [parsed.trim()];
        }
      } catch (e) {
        //console.log('JSON parse failed, treating as direct string:', e);
        // If parsing fails, treat as direct string
        if (images.trim() !== '') {
          imageUrls = [images.trim()];
        }
      }
    } else if (Array.isArray(images)) {
      //console.log('Images is already an array:', images);
      imageUrls = images
        .filter(item => typeof item === 'string' && item.trim() !== '')
        .map(item => item.trim());
    }

    //console.log('Processed imageUrls:', imageUrls);

    // Get the first valid URL
    const finalUrl = imageUrls.length > 0 ? imageUrls[0] : '/images/placeholder.png';

    // Final validation - ensure it's a valid URL format
    if (typeof finalUrl !== 'string' || finalUrl.trim() === '') {
      //console.log('Invalid finalUrl, using placeholder:', finalUrl);
      return '/images/placeholder.png';
    }

    // Check if it's a valid URL format
    const trimmedUrl = finalUrl.trim();
    if (!trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      //console.log('Invalid URL format, using placeholder:', trimmedUrl);
      return '/images/placeholder.png';
    }

    //console.log('Final image URL:', trimmedUrl);
    return trimmedUrl;
  };

  const imageUrl = getImageUrl();
  const displayPrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  return (
    <Link href={`/san-pham/${slug}`} className={`group flex ${reverse ? 'flex-col md:flex-row-reverse md:text-right' : 'flex-col md:flex-row'} items-center md:items-center gap-4 rounded-lg overflow-hidden shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-4`}>
      <div className="relative overflow-hidden flex-shrink-0 w-full md:w-80">
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
            -{discountPercent}%
          </div>
        )}
        {imageUrl && imageUrl.startsWith('/') ? (
          <Image
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain"
            width={300}
            height={250}
          />
        ) : (
          <div className="w-full h-[250px] bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Không có hình ảnh</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className={`flex items-center justify-between ${reverse ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-green-700">
              {displayPrice.toLocaleString('vi-VN')}₫
            </span>
            {hasDiscount && (
              <span className="text-gray-500 text-sm line-through">
                {price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
          <button className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-700 hover:text-white transition-colors duration-300">
              <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </Link>
  );
};

interface FeaturedProductsProps {
  productsData: Product[];
}

const FeaturedProducts: FC<FeaturedProductsProps> = ({ productsData }) => {
  if (!productsData || productsData.length === 0) {
    return (
      <section id="products" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p>Chưa có sản phẩm nổi bật nào.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sản Phẩm Nổi Bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Khám phá các sản phẩm thuốc đông y chất lượng cao từ các thảo dược tự nhiên, được chế biến theo công thức cổ truyền kết hợp công nghệ hiện đại.</p>
        </div>
        
        <div className="flex flex-col gap-8">
          {productsData.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
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