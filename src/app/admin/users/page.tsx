import { FC } from 'react';
import Link from 'next/link';

const UsersPage: FC = () => {
  // Trong thực tế, dữ liệu này sẽ được lấy từ API
  const users = [
    { 
      id: '1', 
      name: 'Nguyễn Văn A', 
      email: 'nguyenvana@example.com', 
      phone: '0901234567', 
      role: 'Đối tác',
      status: 'Hoạt động',
      orders: 5,
      referralCode: 'REF001',
      discount: 15,
      unpaidAmount: 2500000,
      createdAt: '10/01/2024'
    },
    { 
      id: '2', 
      name: 'Trần Thị B', 
      email: 'tranthib@example.com', 
      phone: '0912345678', 
      role: 'Cộng tác viên',
      status: 'Hoạt động',
      orders: 3,
      referralCode: 'REF002',
      discount: 10,
      unpaidAmount: 1800000,
      createdAt: '15/01/2024'
    },
    { 
      id: '3', 
      name: 'Lê Văn C', 
      email: 'levanc@example.com', 
      phone: '0923456789', 
      role: 'Admin',
      status: 'Hoạt động',
      orders: 0,
      referralCode: 'REF003',
      discount: 0,
      unpaidAmount: 0,
      createdAt: '05/01/2024'
    },
    { 
      id: '4', 
      name: 'Phạm Thị D', 
      email: 'phamthid@example.com', 
      phone: '0934567890', 
      role: 'Khách hàng',
      status: 'Bị khóa',
      orders: 2,
      referralCode: 'REF004',
      discount: 8,
      unpaidAmount: 1200000,
      createdAt: '20/01/2024'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <i className="fas fa-file-excel mr-2"></i>Xuất Excel
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            <i className="fas fa-list-alt mr-2"></i>DS chờ chi trả
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            <i className="fas fa-file-import mr-2"></i>Import đối tác
          </button>
          <Link 
            href="/admin/users/add" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i className="fas fa-user-plus mr-2"></i>Thêm người dùng
          </Link>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input 
              type="text" 
              placeholder="Tên hoặc email..." 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="khach-hang">Khách hàng</option>
              <option value="doi-tac">Đối tác</option>
              <option value="cong-tac-vien">Cộng tác viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Tất cả trạng thái</option>
              <option value="hoat-dong">Hoạt động</option>
              <option value="bi-khoa">Bị khóa</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              <i className="fas fa-search mr-2"></i>Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Bảng người dùng */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã giới thiệu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiết khấu (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiền chưa chi trả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.referralCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.discount}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.unpaidAmount.toLocaleString()}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/users/edit/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
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
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> của <span className="font-medium">4</span> người dùng
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <i className="fas fa-chevron-left"></i>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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

export default UsersPage;