'use client';

import { FC, useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';

const AdminSidebar: FC<{ children?: ReactNode }> = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/admin/me/permissions');
        const data = await response.json();
        if (data.success) {
          setPermissions(data.permissions);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Hàm kiểm tra quyền truy cập menu
  const hasPermission = (requiredPermission: string) => {
    // ADMIN có toàn quyền (permissions = ['*'])
    if (permissions.includes('*')) return true;
    return permissions.includes(requiredPermission);
  };

  // Danh sách menu với permissions tương ứng
  const menuItems = [
    { title: 'Tổng quan', path: '/admin', icon: 'fas fa-tachometer-alt', permission: 'dashboard.view' },
    {
      title: 'Sản phẩm',
      path: '/admin/products',
      icon: 'fas fa-box',
      permission: 'products.view',
      children: [
        { title: 'Danh sách', path: '/admin/products', icon: 'fas fa-list', permission: 'products.view' },
        { title: 'Thêm mới', path: '/admin/products/add', icon: 'fas fa-plus', permission: 'products.create' },
        { title: 'Danh mục', path: '/admin/categories', icon: 'fas fa-folder', permission: 'categories.view' }
      ]
    },
    {
      title: 'Bài viết',
      path: '/admin/posts',
      icon: 'fas fa-newspaper',
      permission: 'posts.view',
      children: [
        { title: 'Danh sách', path: '/admin/posts', icon: 'fas fa-list', permission: 'posts.view' },
        { title: 'Thêm mới', path: '/admin/posts/add', icon: 'fas fa-plus', permission: 'posts.create' },
        { title: 'Danh mục', path: '/admin/post-categories', icon: 'fas fa-folder', permission: 'post_categories.view' }
      ]
    },
    { 
      title: 'Đơn hàng', 
      path: '/admin/orders', 
      icon: 'fas fa-shopping-cart',
      permission: 'orders.view'
    },
    {
      title: 'Người dùng',
      path: '/admin/users',
      icon: 'fas fa-users',
      permission: 'users.view',
      children: [
        { title: 'Danh sách', path: '/admin/users', icon: 'fas fa-list', permission: 'users.view' },
        // { title: 'Thêm mới', path: '/admin/users/add', icon: 'fas fa-user-plus', permission: 'users.create' }
      ]
    },
    {
      title: 'Affiliate',
      path: '/admin/affiliate',
      icon: 'fas fa-handshake',
      permission: 'affiliate.view',      children: [
        { title: 'Tổng quan', path: '/admin/affiliate', icon: 'fas fa-chart-line', permission: 'affiliate.view' },
        { title: 'Quản lý Users', path: '/admin/affiliate/users', icon: 'fas fa-users', permission: 'affiliate.manage' },
        { title: 'Quản lý Links', path: '/admin/affiliate/links', icon: 'fas fa-link', permission: 'affiliate.manage' },
        { title: 'Hoa hồng', path: '/admin/affiliate/commissions', icon: 'fas fa-dollar-sign', permission: 'affiliate.manage' },
        { title: 'Duyệt rút tiền', path: '/admin/affiliate/withdrawals', icon: 'fas fa-money-check-alt', permission: 'affiliate.manage' },
        { title: 'Báo cáo', path: '/admin/affiliate/analytics', icon: 'fas fa-chart-bar', permission: 'affiliate.manage' },
        { title: 'Cài đặt', path: '/admin/affiliate/settings', icon: 'fas fa-cogs', permission: 'affiliate.manage' }
      ]
    },
    {
      title: 'Trang chủ',
      path: '/admin/homepage',
      icon: 'fas fa-home',
      permission: 'homepage.view',
      children: [
        { title: 'Tổng quan', path: '/admin/homepage', icon: 'fas fa-eye', permission: 'homepage.view' },
        { title: 'Banner', path: '/admin/homepage/hero', icon: 'fas fa-image', permission: 'homepage.hero' },
        { title: 'Giới thiệu', path: '/admin/homepage/about', icon: 'fas fa-info-circle', permission: 'homepage.about' },
        { title: 'Lợi ích', path: '/admin/homepage/benefits', icon: 'fas fa-star', permission: 'homepage.benefits' },
        { title: 'Đánh giá', path: '/admin/homepage/testimonials', icon: 'fas fa-quote-left', permission: 'homepage.testimonials' },
        { title: 'Sản phẩm nổi bật', path: '/admin/homepage/featured-products', icon: 'fas fa-trophy', permission: 'homepage.products' },
        { title: 'Danh mục', path: '/admin/homepage/categories', icon: 'fas fa-th-large', permission: 'homepage.categories' }
      ]
    },    { 
      title: 'Cài đặt', 
      path: '/admin/settings',
      icon: 'fas fa-cog',
      permission: 'settings.view',
      children: [
        { title: 'Thông tin liên hệ', path: '/admin/settings/contact', icon: 'fas fa-address-card', permission: 'settings.view' },
        { title: 'Cài đặt thanh toán', path: '/admin/settings/payment', icon: 'fas fa-money-check-alt', permission: 'settings.view' }
      ]
    }
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleExpanded = (path: string) => {
    if (isCollapsed) return;

    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const isExpanded = (path: string) => {
    return expandedItems.includes(path) || pathname.startsWith(path);
  };

  const renderMenuItem = (item: any) => {
    // Kiểm tra quyền truy cập menu
    if (!hasPermission(item.permission)) {
      return null;
    }

    // Kiểm tra quyền truy cập menu con
    if (item.children) {
      const hasChildPermissions = item.children.some((child: any) => hasPermission(child.permission));
      if (!hasChildPermissions) {
        return null;
      }
    }

    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
    const hasChildren = item.children && item.children.length > 0;
    const filteredChildren = item.children?.filter((child: any) => hasPermission(child.permission));

    return (
      <li key={item.path}>
        <div
          className={`flex items-center px-4 py-3 transition-colors duration-200 cursor-pointer ${
            isActive
              ? 'bg-green-50 text-green-600 border-r-4 border-green-600'
              : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? item.title : undefined}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.path);
            }
            setIsOpen(false);
          }}
        >
          <Link
            href={item.path}
            className="flex items-center flex-1"
            onClick={(e) => {
              if (hasChildren && !isCollapsed) {
                e.preventDefault();
              }
            }}
          >
            <i className={`${item.icon} w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`}></i>
            {!isCollapsed && <span className="font-medium">{item.title}</span>}
          </Link>

          {hasChildren && !isCollapsed && (
            <i className={`fas fa-chevron-${isExpanded(item.path) ? 'up' : 'down'} text-sm ml-auto`}></i>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && !isCollapsed && isExpanded(item.path) && filteredChildren.length > 0 && (
          <ul className="ml-6 mt-1 space-y-1">
            {filteredChildren.map((child: any) => {
              const isChildActive = pathname === child.path;
              return (
                <li key={child.path}>
                  <Link
                    href={child.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded ${
                      isChildActive
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <i className={`${child.icon} w-4 h-4 mr-2`}></i>
                    <span>{child.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Collapsed tooltip with submenu */}
        {hasChildren && isCollapsed && filteredChildren.length > 0 && (
          <div className="relative group">
            <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <div className="font-medium text-green-600 mb-2 px-2">{item.title}</div>
                {filteredChildren.map((child: any) => (
                  <Link
                    key={child.path}
                    href={child.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-2 py-2 text-sm rounded transition-colors ${
                      pathname === child.path
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <i className={`${child.icon} w-4 h-4 mr-2`}></i>
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  const SidebarContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className="h-full bg-white border-r p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`h-full bg-white border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-green-600">Đông Y Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={`ml-auto ${isCollapsed ? 'w-full justify-center' : ''}`}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <VisuallyHidden>
              <DialogTitle>Admin Sidebar</DialogTitle>
            </VisuallyHidden>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;