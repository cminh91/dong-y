import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import SortDropdown from '@/components/products/SortDropdown';
import Pagination from '@/components/products/Pagination';

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface FetchProductsResponse {
  products: ProductProps[];
  pagination: PaginationProps;
}

interface SearchParamsType {
  [key: string]: string;
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    featured?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Sản phẩm - Đông Y Pharmacy',
  description: 'Khám phá bộ sưu tập sản phẩm đông y chất lượng cao tại Đông Y Pharmacy',
};

// Fetch products from API
async function fetchProducts(searchParams: SearchParamsType): Promise<FetchProductsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL('/api/products', baseUrl);

  // Add search params to URL
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key]) {
      url.searchParams.set(key, searchParams[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store' // Always fetch fresh data for SSR
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.success ? data.data : {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12
      }
    };
  }
}

const ProductsPage: FC<ProductsPageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const categorySlug = params.category;
  const search = params.search;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  const featured = params.featured;

  // Fetch products from API
  const searchParamsForAPI: SearchParamsType = {};
  if (page > 1) searchParamsForAPI.page = page.toString();
  if (categorySlug) searchParamsForAPI.category = categorySlug;
  if (search) searchParamsForAPI.search = search;
  if (sortBy) searchParamsForAPI.sortBy = sortBy;
  if (sortOrder) searchParamsForAPI.sortOrder = sortOrder;
  if (featured) searchParamsForAPI.featured = featured;
  searchParamsForAPI.limit = '12';

  const { products, pagination } = await fetchProducts(searchParamsForAPI);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">Sản phẩm</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600 mt-2">
            Tìm thấy {pagination.totalCount || 0} sản phẩm
            {search && ` cho "${search}"`}
            {categorySlug && ` trong danh mục`}
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center space-x-4">
          <SortDropdown sortBy={sortBy} sortOrder={sortOrder} />
        </div>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product: ProductProps) => {
              const displayPrice = product.salePrice || product.price;
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
                : 0;

              return (
                <div key={product.id} className="card group">
                  <div className="relative overflow-hidden">
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        -{discountPercent}%
                      </div>
                    )}
                    <Image
                      src={product.images?.[0] || '/images/placeholder.png'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                      height={250}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        href={`/san-pham/${product.slug}`}
                        className="bg-white text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-green-500 hover:text-white transition-colors duration-300"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-700 text-lg">
                            {displayPrice.toLocaleString()}₫
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-500 text-sm line-through">
                              {product.price.toLocaleString()}₫
                            </span>
                          )}
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <p className="text-orange-500 text-xs">Chỉ còn {product.stock} sản phẩm</p>
                        )}
                        {product.stock === 0 && (
                          <p className="text-red-500 text-xs">Hết hàng</p>
                        )}
                      </div>
                      <button
                        className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-700 hover:text-white transition-colors duration-300 disabled:opacity-50"
                        disabled={product.stock === 0}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-search text-6xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600 mb-6">
            {search
              ? `Không có sản phẩm nào phù hợp với từ khóa "${search}"`
              : 'Không có sản phẩm nào trong danh mục này'
            }
          </p>
          <Link
            href="/san-pham"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;