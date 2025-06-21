'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  fullName: string;
  email: string;
  role: string;
  availableBalance?: number;
  totalCommission?: number;
}

export default function AccountHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        router.push('/dang-nhap');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-leaf text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dược phẩm Đông Y</h1>
                <p className="text-xs text-gray-500">Tài khoản cá nhân</p>
              </div>
            </Link>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Balance Info (for affiliates) */}
            {user && (user.role === 'COLLABORATOR' || user.role === 'AGENT') && (
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Số dư khả dụng</p>
                  <p className="font-semibold text-green-600">
                    {(user.availableBalance || 0).toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Tổng hoa hồng</p>
                  <p className="font-semibold text-blue-600">
                    {(user.totalCommission || 0).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Về trang chủ"
              >
                <i className="fas fa-home"></i>
              </Link>
              
              <Link
                href="/gio-hang"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Giỏ hàng"
              >
                <i className="fas fa-shopping-cart"></i>
              </Link>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <i className="fas fa-bell"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-600 text-sm"></i>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'COLLABORATOR' && 'Cộng tác viên'}
                    {user?.role === 'AGENT' && 'Đại lý'}
                    {user?.role === 'CUSTOMER' && 'Khách hàng'}
                    {user?.role === 'ADMIN' && 'Quản trị viên'}
                  </p>
                </div>
                <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <Link
                    href="/tai-khoan"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fas fa-user mr-2"></i>
                    Thông tin cá nhân
                  </Link>
                  
                  <Link
                    href="/tai-khoan/don-hang"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i className="fas fa-shopping-bag mr-2"></i>
                    Đơn hàng của tôi
                  </Link>

                  {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                    <>
                      <hr className="my-1" />
                      <Link
                        href="/tai-khoan/affiliate"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        Affiliate Dashboard
                      </Link>
                      <Link
                        href="/tai-khoan/affiliate/withdrawals"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="fas fa-money-bill-wave mr-2"></i>
                        Rút tiền
                      </Link>
                    </>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <hr className="my-1" />
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Quản trị hệ thống
                      </Link>
                    </>
                  )}

                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
