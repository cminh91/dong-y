import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import ProductActions from '@/components/admin/ProductActions';
import ProductFilters from '@/components/admin/ProductFilters';
import AdminPagination from '@/components/admin/AdminPagination';

export const metadata: Metadata = {
  title: 'Quản lý sản phẩm - Admin',
  description: 'Quản lý sản phẩm trong hệ thống',
};

interface Product {
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

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

// Fetch products from API
async function fetchProducts(searchParams: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = new URL('/api/products', fullBaseUrl);

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
    return data.success ? data.data : { products: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], pagination: {} };
  }
}

// Fetch categories for filter
async function fetchCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = `${fullBaseUrl}/api/categories?limit=100`;

  try {
    const response = await fetch(url, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.success ? data.data.categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search;
  const categorySlug = params.category;
  const status = params.status;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Fetch products and categories
  const [{ products, pagination }, categories] = await Promise.all([
    fetchProducts({
      page: page.toString(),
      search,
      category: categorySlug,
      status,
      sortBy,
      sortOrder,
      limit: '20'
    }),
    fetchCategories()
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Tìm thấy {pagination.totalCount || 0} sản phẩm
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm sản phẩm
        </Link>
      </div>

      {/* Filter and Search */}
      <ProductFilters categories={categories} />

      {/* Product List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {products && products.length > 0 ? (
          <>
            {/* Table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product: Product) => {
                    const displayPrice = product.salePrice || product.price;
                    const hasDiscount = product.salePrice && product.salePrice < product.price;

                    return (
                      <tr key={product.id}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={product.images?.[0] || '/images/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.isFeatured && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                    <i className="fas fa-star mr-1"></i>Nổi bật
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <span className="font-medium">{displayPrice.toLocaleString()}₫</span>
                            {hasDiscount && (
                              <div className="text-xs text-gray-500 line-through">
                                {product.price.toLocaleString()}₫
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={product.stock <= 5 && product.stock > 0 ? 'text-orange-600 font-medium' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.status === 'ACTIVE'
                                ? (product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800')
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.status === 'ACTIVE'
                              ? (product.stock > 0 ? 'Đang bán' : 'Hết hàng')
                              : 'Ngừng bán'
                            }
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <ProductActions
                            productId={product.id}
                            productName={product.name}
                            productStock={product.stock}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card layout for smaller screens */}
            <div className="md:hidden divide-y divide-gray-200">
              {products.map((product: Product) => {
                const displayPrice = product.salePrice || product.price;
                const hasDiscount = product.salePrice && product.salePrice < product.price;

                return (
                  <div key={product.id} className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 h-12 w-12 relative">
                        <Image
                          src={product.images?.[0] || '/images/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            <i className="fas fa-star mr-1"></i>Nổi bật
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Danh mục:</span> {product.category.name}
                      </div>
                      <div>
                        <span className="text-gray-500">Giá:</span>
                        <div className="font-medium">
                          {displayPrice.toLocaleString()}₫
                          {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                              {product.price.toLocaleString()}₫
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Tồn kho:</span>
                        <span className={product.stock <= 5 && product.stock > 0 ? 'text-orange-600 font-medium' : ''}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <span
                          className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'ACTIVE'
                              ? (product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800')
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.status === 'ACTIVE'
                            ? (product.stock > 0 ? 'Đang bán' : 'Hết hàng')
                            : 'Ngừng bán'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <ProductActions
                        productId={product.id}
                        productName={product.name}
                        productStock={product.stock}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-box-open text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-6">
              {search || categorySlug || status
                ? 'Không có sản phẩm nào phù hợp với bộ lọc hiện tại'
                : 'Chưa có sản phẩm nào trong hệ thống'
              }
            </p>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Thêm sản phẩm đầu tiên
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <AdminPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}