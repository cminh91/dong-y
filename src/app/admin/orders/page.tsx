'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  itemCount: number;
  totalQuantity: number;
}

const OrdersPage: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setTotalPages(result.data.pagination.pages);
      } else {
        console.error('Failed to fetch orders:', result.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh orders list
        fetchOrders();
        alert('Cập nhật trạng thái thành công!');
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle export Excel
  const handleExportExcel = async () => {
    try {
      // Build query parameters for export
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      // Fetch Excel file
      const response = await fetch(`/api/admin/orders/export?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        alert('Lỗi: ' + errorData.error);
        return;
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'don-hang.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  // Mock data for fallback (keeping original structure)
  const mockOrders = [
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
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center"
          >
            <i className="fas fa-download mr-2"></i>Xuất Excel
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Mã đơn hoặc tên khách hàng..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="FAILED">Thanh toán thất bại</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/admin/orders/${order.id}`}>{order.orderNumber || order.id}</Link>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user?.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(order.finalAmount || 0).toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="SHIPPING">Đang giao</option>
                        <option value="DELIVERED">Đã giao</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
                            // TODO: Implement delete
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card layout for smaller screens */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không có đơn hàng nào
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="mb-2">
                  <div className="text-sm font-medium text-blue-600">
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber || order.id}</Link>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{order.user?.fullName || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Ngày đặt:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-500">Tổng tiền:</span> {(order.finalAmount || 0).toLocaleString('vi-VN')}₫
                  </div>
                  <div>
                    <span className="text-gray-500">Thanh toán:</span> {order.paymentMethod || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-500">Số món:</span> {order.itemCount || 0}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Trạng thái:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                    <i className="fas fa-eye"></i>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
                        // TODO: Implement delete
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Trang <span className="font-medium">{currentPage}</span> trong tổng số{' '}
                <span className="font-medium">{totalPages}</span> trang
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'SHIPPING':
      return 'bg-blue-100 text-blue-800';
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-800';
    case 'PENDING':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default OrdersPage;