import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HTMLContent from '@/components/common/HTMLContent';
import AddToCartButton from '@/components/product/AddToCartButton';
import QuickAddToCart from '@/components/product/QuickAddToCart';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch product from API
async function fetchProduct(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = `${fullBaseUrl}/api/products/by-slug/${slug}`;

  console.log('Fetching product with slug:', slug);
  console.log('API URL:', url);

  try {
    const response = await fetch(url, {
      cache: 'no-store' // Always fetch fresh data for SSR
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.log('Response not OK');
      return null;
    }

    const data = await response.json();
    console.log('API response success:', data.success);
    console.log('Product found:', !!data.data?.product);

    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProduct(slug);

  if (!data || !data.product) {
    return {
      title: 'Sản phẩm không tồn tại - Đông Y Pharmacy',
    };
  }

  const product = data.product;

  return {
    title: `${product.name} - Đông Y Pharmacy`,
    description: product.description || '',
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

const ProductDetailPage: FC<ProductDetailPageProps> = async ({ params, searchParams }) => {
  const { slug } = await params;
  const urlParams = await searchParams;

  console.log('ProductDetailPage - slug:', slug);

  // Check for affiliate tracking parameters
  const referralCode = urlParams.ref as string;
  const affiliateSlug = urlParams.aff as string;

  // Fetch product data from API
  const data = await fetchProduct(slug);

  console.log('ProductDetailPage - data received:', !!data);
  console.log('ProductDetailPage - product exists:', !!data?.product);

  if (!data || !data.product) {
    console.log('ProductDetailPage - calling notFound()');
    notFound();
  }

  const { product, relatedProducts } = data;

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Affiliate tracking */}
      <AffiliateTracker
        affiliateSlug={affiliateSlug}
        referralCode={referralCode}
      />

      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link href="/san-pham" className="text-gray-600 hover:text-green-600">Sản phẩm</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">{product.name}</li>
        </ol>
      </nav>

      {/* Chi tiết sản phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Hình ảnh sản phẩm */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={product.images?.[0] || '/images/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discountPercent}%
              </div>
            )}
          </div>
          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border">
                  <Image 
                    src={image} 
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.category.name}</p>
          </div>

          {/* Stock status */}
          <div className="flex items-center space-x-4">
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600">
                <i className="fas fa-check-circle mr-2"></i>
                <span>Còn hàng ({product.stock} sản phẩm)</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <i className="fas fa-times-circle mr-2"></i>
                <span>Hết hàng</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              SKU: {product.sku}
            </div>
          </div>

          {/* Giá */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-green-700">{displayPrice.toLocaleString()}₫</span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">{product.price.toLocaleString()}₫</span>
              )}
              {hasDiscount && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="text-sm text-red-600">
                Tiết kiệm: {(product.price - product.salePrice!).toLocaleString()}₫
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              stock: product.stock
            }}
          />
        </div>
      </div>

      {/* Chi tiết sản phẩm */}
      {product.content && (
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Chi tiết sản phẩm</h2>
          <HTMLContent content={product.content} />
        </div>
      )}

      {/* Sản phẩm liên quan */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct: any) => (
              <div key={relatedProduct.id} className="card group">
                <div className="relative overflow-hidden">
                  <Image
                    src={relatedProduct.images?.[0] || '/images/placeholder.png'}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                    width={300}
                    height={200}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/san-pham/${relatedProduct.slug}`} className="bg-white text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-green-500 hover:text-white transition-colors duration-300">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{relatedProduct.category.name}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-green-700">
                        {(relatedProduct.salePrice || relatedProduct.price).toLocaleString()}₫
                      </span>
                      {relatedProduct.salePrice && relatedProduct.salePrice < relatedProduct.price && (
                        <span className="text-gray-500 text-sm line-through ml-2">
                          {relatedProduct.price.toLocaleString()}₫
                        </span>
                      )}
                    </div>
                    <QuickAddToCart
                      product={{
                        id: relatedProduct.id,
                        name: relatedProduct.name,
                        stock: relatedProduct.stock
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
