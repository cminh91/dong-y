'use client';
import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  name: string;
  imageUrls: string[];
  category: { name: string };
  price: number;
  stock: number;
};

const ProductsPage: FC = () => {
  // Dữ liệu mẫu thay thế cho dữ liệu từ Prisma
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'HEPASAKY GOLD',
      imageUrls: ['/images/hepasaky.png'],
      category: { name: 'Thuốc bổ gan' },
      price: 320000,
      stock: 25
    },
    {
      id: '2',
      name: 'LYPASAKY',
      imageUrls: ['/images/lypasaky.png'],
      category: { name: 'Thuốc bổ' },
      price: 450000,
      stock: 15
    },
    {
      id: '3',
      name: 'Trà Thảo Mộc',
      imageUrls: ['/images/product-placeholder.png'],
      category: { name: 'Trà thảo dược' },
      price: 120000,
      stock: 0
    }
  ]);

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      // Xóa sản phẩm khỏi state (không gọi API)
      setProducts(products.filter(p => p.id !== id));
      toast.success('Xóa sản phẩm thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm');
      console.error(error);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Link
          href="/admin/products/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm sản phẩm
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên sản phẩm..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả danh mục</option>
              {/* TODO: Fetch actual categories */}
              <option value="thuoc-bo">Thuốc bổ</option>
              <option value="thuoc-bo-gan">Thuốc bổ gan</option>
              <option value="duoc-lieu">Dược liệu</option>
              <option value="gia-vi-dong-y">Gia vị Đông y</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="dang-ban">Đang bán</option>
              <option value="het-hang">Hết hàng</option>
              <option value="ngung-ban">Ngừng bán</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
              <i className="fas fa-search mr-2"></i>Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                         {product.imageUrls && product.imageUrls.length > 0 && (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                         )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category.name}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.price.toLocaleString()}₫</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > 0 ? 'Đang bán' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for smaller screens */}
        <div className="md:hidden divide-y divide-gray-200">
          {products.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-12 w-12 relative">
                   {product.imageUrls && product.imageUrls.length > 0 && (
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                   )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500">ID: {product.id}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Danh mục:</span> {product.category.name}
                </div>
                <div>
                  <span className="text-gray-500">Giá:</span> {product.price.toLocaleString()}₫
                </div>
                <div>
                  <span className="text-gray-500">Tồn kho:</span> {product.stock}
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <span
                    className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock > 0 ? 'Đang bán' : 'Hết hàng'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                  <i className="fas fa-eye"></i>
                </Link>
                <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900">
                  <i className="fas fa-edit"></i>
                </Link>
                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{products.length}</span> của{' '}
              <span className="font-medium">{products.length}</span> sản phẩm
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <i className="fas fa-chevron-left"></i>
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <i className="fas fa-chevron-right"></i>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;