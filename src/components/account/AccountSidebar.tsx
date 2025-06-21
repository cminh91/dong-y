'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  fullName: string;
  email: string;
  role: string;
  availableBalance?: number;
}

export default function AccountSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

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

  const menuItems = [
    {
      title: 'Tổng quan',
      icon: 'fas fa-tachometer-alt',
      href: '/tai-khoan',
      exact: true
    },
    {
      title: 'Thông tin cá nhân',
      icon: 'fas fa-user',
      href: '/tai-khoan/thong-tin',
    },
    {
      title: 'Đơn hàng của tôi',
      icon: 'fas fa-shopping-bag',
      href: '/tai-khoan/don-hang',
    },
    {
      title: 'Địa chỉ giao hàng',
      icon: 'fas fa-map-marker-alt',
      href: '/tai-khoan/dia-chi',
    },
    {
      title: 'Đổi mật khẩu',
      icon: 'fas fa-lock',
      href: '/tai-khoan/doi-mat-khau',
    }
  ];

  // Add affiliate menu items for collaborators and agents
  const affiliateMenuItems = [
    {
      title: 'Affiliate Dashboard',
      icon: 'fas fa-chart-line',
      href: '/tai-khoan/affiliate',
      exact: true
    },
    {
      title: 'Quản lý liên kết',
      icon: 'fas fa-link',
      href: '/tai-khoan/affiliate/links',
    },
    {
      title: 'Hiệu suất',
      icon: 'fas fa-chart-bar',
      href: '/tai-khoan/affiliate/performance',
    },
    {
      title: 'Hoa hồng',
      icon: 'fas fa-coins',
      href: '/tai-khoan/affiliate/commissions',
    },
    {
      title: 'Rút tiền',
      icon: 'fas fa-money-bill-wave',
      href: '/tai-khoan/affiliate/withdrawals',
    },
    {
      title: 'Giới thiệu',
      icon: 'fas fa-users',
      href: '/tai-khoan/affiliate/referrals',
    },
    {
      title: 'Cài đặt',
      icon: 'fas fa-cog',
      href: '/tai-khoan/affiliate/settings',
    }
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isAffiliate = user?.role === 'COLLABORATOR' || user?.role === 'AGENT';

  return (
    <div className={`bg-white shadow-sm border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tài khoản</h2>
              <p className="text-sm text-gray-500">Quản lý thông tin cá nhân</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-gray-400`}></i>
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-gray-600"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
              {isAffiliate && (
                <p className="text-xs text-green-600 font-medium">
                  {(user.availableBalance || 0).toLocaleString('vi-VN')}₫
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-2">
        {/* General Menu */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tài khoản
              </h3>
            </div>
          )}
          
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isCollapsed ? item.title : undefined}
            >
              <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'mr-3'}`}></i>
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>

        {/* Affiliate Menu */}
        {isAffiliate && (
          <div className="mt-6 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Affiliate
                </h3>
              </div>
            )}
            
            {affiliateMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'mr-3'}`}></i>
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Quick Stats (collapsed view) */}
      {isCollapsed && isAffiliate && user && (
        <div className="absolute bottom-4 left-2 right-2">
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <i className="fas fa-wallet text-green-600 text-lg"></i>
            <p className="text-xs text-green-600 font-medium mt-1">
              {(user.availableBalance || 0).toLocaleString('vi-VN', { notation: 'compact' })}₫
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
