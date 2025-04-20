'use client';
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PromotionsPage: FC = () => {
  // Mock data for promotions list
  const promotions = [
    {
      id: '1',
      name: 'Giảm giá mùa hè',
      code: 'SUMMER2024',
      discount: 15,
      discountType: 'Phần trăm',
      minOrder: 500000,
      maxDiscount: 200000,
      startDate: '01/06/2024',
      endDate: '30/06/2024',
      status: 'Sắp diễn ra',
      usageLimit: 100,
      usageCount: 0,
      image: '/images/hepasaky.png',
    },
    {
      id: '2',
      name: 'Miễn phí vận chuyển',
      code: 'FREESHIP',
      discount: 30000,
      discountType: 'Cố định',
      minOrder: 300000,
      maxDiscount: 30000,
      startDate: '15/05/2024',
      endDate: '15/06/2024',
      status: 'Đang diễn ra',
      usageLimit: 200,
      usageCount: 45,
      image: '/images/lypasaky.png',
    },
    {
      id: '3',
      name: 'Khách hàng mới',
      code: 'NEWCUSTOMER',
      discount: 10,
      discountType: 'Phần trăm',
      minOrder: 200000,
      maxDiscount: 100000,
      startDate: '01/05/2024',
      endDate: '31/05/2024',
      status: 'Đang diễn ra',
      usageLimit: 300,
      usageCount: 120,
      image: '/images/trongdong.png',
    },
    {
      id: '4',
      name: 'Khuyến mãi tháng 4',
      code: 'APRIL2024',
      discount: 12,
      discountType: 'Phần trăm',
      minOrder: 400000,
      maxDiscount: 150000,
      startDate: '01/04/2024',
      endDate: '30/04/2024',
      status: 'Đã kết thúc',
      usageLimit: 150,
      usageCount: 98,
      image: '/images/hepasaky.png',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
        <Link
          href="/admin/promotions/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm khuyến mãi
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên hoặc mã khuyến mãi..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả loại</option>
              <option value="phan-tram">Phần trăm</option>
              <option value="co-dinh">Cố định</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="sap-dien-ra">Sắp diễn ra</option>
              <option value="dang-dien-ra">Đang diễn ra</option>
              <option value="da-ket-thuc">Đã kết thúc</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm flex items-center">
              <i className="fas fa-search mr-2"></i>Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Promotion List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khuyến mãi</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={promotion.image}
                          alt={promotion.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-sm text-gray-500">
                          Đơn tối thiểu: {promotion.minOrder.toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{promotion.code}</div>
                    <div className="text-sm text-gray-500">
                      Đã dùng: {promotion.usageCount}/{promotion.usageLimit}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {promotion.discountType === 'Phần trăm'
                        ? `${promotion.discount}%`
                        : `${promotion.discount.toLocaleString()}₫`}
                    </div>
                    {promotion.discountType === 'Phần trăm' && (
                      <div className="text-sm text-gray-500">
                        Tối đa: {promotion.maxDiscount.toLocaleString()}₫
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{promotion.startDate}</div>
                    <div className="text-sm text-gray-500">đến {promotion.endDate}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                      {promotion.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/promotions/edit/${promotion.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
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
          {promotions.map((promotion) => (
            <div key={promotion.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <Image
                    src={promotion.image}
                    alt={promotion.name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                  <div className="text-xs text-gray-500">Mã: {promotion.code}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Giảm giá:</span>{' '}
                  {promotion.discountType === 'Phần trăm'
                    ? `${promotion.discount}%`
                    : `${promotion.discount.toLocaleString()}₫`}
                </div>
                <div>
                  <span className="text-gray-500">Đơn tối thiểu:</span> {promotion.minOrder.toLocaleString()}₫
                </div>
                {promotion.discountType === 'Phần trăm' && (
                  <div>
                    <span className="text-gray-500">Tối đa:</span> {promotion.maxDiscount.toLocaleString()}₫
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Đã dùng:</span> {promotion.usageCount}/{promotion.usageLimit}
                </div>
                <div>
                  <span className="text-gray-500">Thời gian:</span> {promotion.startDate}
                </div>
                <div>
                  <span className="text-gray-500">Kết thúc:</span> {promotion.endDate}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`ml-1 px-2 py-1 inline-flex text-xs

 leading-5 font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                    {promotion.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <Link href={`/admin/promotions/edit/${promotion.id}`} className="text-indigo-600 hover:text-indigo-900">
                  <i className="fas fa-edit"></i>
                </Link>
                <button className="text-red-600 hover:text-red-900">
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
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> của{' '}
              <span className="font-medium">4</span> khuyến mãi
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Trang trước</span>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
                <button
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Trang sau</span>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Đang diễn ra':
      return 'bg-green-100 text-green-800';
    case 'Sắp diễn ra':
      return 'bg-blue-100 text-blue-800';
    case 'Đã kết thúc':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default PromotionsPage;