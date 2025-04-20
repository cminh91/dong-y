'use client';
import { FC } from 'react';
import Link from 'next/link';

const OrdersPage: FC = () => {
  // Mock data for orders list
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      date: '15/05/2024',
      total: 850000,
      status: 'Đã giao',
      paymentMethod: 'COD',
      items: 3,
    },
    {
      id: 'ORD-002',
      customer: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      date: '14/05/2024',
      total: 1250000,
      status: 'Đang giao',
      paymentMethod: 'Chuyển khoản',
      items: 5,
    },
    {
      id: 'ORD-003',
      customer: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      date: '13/05/2024',
      total: 450000,
      status: 'Đã giao',
      paymentMethod: 'COD',
      items: 2,
    },
    {
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      date: '12/05/2024',
      total: 720000,
      status: 'Đã hủy',
      paymentMethod: 'COD',
      items: 4,
    },
    {
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      date: '11/05/2024',
      total: 950000,
      status: 'Đang xử lý',
      paymentMethod: 'Chuyển khoản',
      items: 3,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center">
            <i className="fas fa-download mr-2"></i>Xuất Excel
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Mã đơn hoặc tên khách hàng..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="dang-xu-ly">Đang xử lý</option>
              <option value="dang-giao">Đang giao</option>
              <option value="da-giao">Đã giao</option>
              <option value="da-huy">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả phương thức</option>
              <option value="cod">COD</option>
              <option value="chuyen-khoan">Chuyển khoản</option>
              <option value="vi-dien-tu">Ví điện tử</option>
              <option value="the-tin-dung">Thẻ tín dụng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm flex items-center">
              <i className="fas fa-search mr-2"></i>Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link href={`/admin/orders/${order.id}`}>{order.id}</Link>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total.toLocaleString()}₫</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <i className="fas fa-eye"></i>
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
          {orders.map((order) => (
            <div key={order.id} className="p-4">
              <div className="mb-2">
                <div className="text-sm font-medium text-blue-600">
                  <Link href={`/admin/orders/${order.id}`}>{order.id}</Link>
                </div>
                <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                <div className="text-xs text-gray-500">{order.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Ngày đặt:</span> {order.date}
                </div>
                <div>
                  <span className="text-gray-500">Tổng tiền:</span> {order.total.toLocaleString()}₫
                </div>
                <div>
                  <span className="text-gray-500">Thanh toán:</span> {order.paymentMethod}
                </div>
                <div>
                  <span className="text-gray-500">Số món:</span> {order.items}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                  <i className="fas fa-eye"></i>
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
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">5</span> của{' '}
              <span className="font-medium">5</span> đơn hàng
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

// Helper function to determine status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Đã giao':
      return 'bg-green-100 text-green-800';
    case 'Đang giao':
      return 'bg-blue-100 text-blue-800';
    case 'Đang xử lý':
      return 'bg-yellow-100 text-yellow-800';
    case 'Đã hủy':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default OrdersPage;