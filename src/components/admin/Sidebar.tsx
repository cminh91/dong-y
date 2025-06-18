
'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@radix-ui/react-dialog';

const AdminSidebar: FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems = [
    { title: 'Tổng quan', path: '/admin', icon: 'fas fa-tachometer-alt' },
    {
      title: 'Sản phẩm',
      path: '/admin/products',
      icon: 'fas fa-box',
      children: [
        { title: 'Danh sách', path: '/admin/products', icon: 'fas fa-list' },
        { title: 'Thêm mới', path: '/admin/products/add', icon: 'fas fa-plus' },
        { title: 'Danh mục', path: '/admin/categories', icon: 'fas fa-folder' }
      ]
    },
    {
      title: 'Bài viết',
      path: '/admin/posts',
      icon: 'fas fa-newspaper',
      children: [
        { title: 'Danh sách', path: '/admin/posts', icon: 'fas fa-list' },
        { title: 'Thêm mới', path: '/admin/posts/add', icon: 'fas fa-plus' },
        { title: 'Danh mục', path: '/admin/post-categories', icon: 'fas fa-folder' }
      ]
    },
    { title: 'Đơn hàng', path: '/admin/orders', icon: 'fas fa-shopping-cart' },
    {
      title: 'Người dùng',
      path: '/admin/users',
      icon: 'fas fa-users',
      children: [
        { title: 'Danh sách', path: '/admin/users', icon: 'fas fa-list' },
        { title: 'Thêm mới', path: '/admin/users/add', icon: 'fas fa-user-plus' }
      ]
    },
    {
      title: 'Affiliate',
      path: '/admin/affiliate',
      icon: 'fas fa-handshake',
      children: [
        { title: 'Tổng quan', path: '/admin/affiliate', icon: 'fas fa-chart-line' },
        { title: 'Quản lý Users', path: '/admin/affiliate/users', icon: 'fas fa-users' },
        { title: 'Quản lý Links', path: '/admin/affiliate/links', icon: 'fas fa-link' },
        { title: 'Hoa hồng', path: '/admin/affiliate/commissions', icon: 'fas fa-dollar-sign' },
        { title: 'Duyệt rút tiền', path: '/admin/affiliate/withdrawals', icon: 'fas fa-money-check-alt' },
        { title: 'Báo cáo', path: '/admin/affiliate/analytics', icon: 'fas fa-chart-bar' },
        { title: 'Cài đặt', path: '/admin/affiliate/settings', icon: 'fas fa-cogs' }
      ]
    },
    { title: 'Hoa hồng', path: '/admin/commissions', icon: 'fas fa-percentage' },
    { title: 'Cài đặt', path: '/admin/settings', icon: 'fas fa-cog' },
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

  const SidebarContent = () => (
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
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li key={index}>
                {/* Main menu item */}
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
                {hasChildren && !isCollapsed && isExpanded(item.path) && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children?.map((child, childIndex) => {
                      const isChildActive = pathname === child.path;
                      return (
                        <li key={childIndex}>
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
                {hasChildren && isCollapsed && (
                  <div className="relative group">
                    <div className="absolute left-full top-0 ml-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        <div className="font-medium text-green-600 mb-2 px-2">{item.title}</div>
                        {item.children?.map((child, childIndex) => (
                          <Link
                            key={childIndex}
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
          })}
        </ul>
      </nav>
    </div>
  );

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
