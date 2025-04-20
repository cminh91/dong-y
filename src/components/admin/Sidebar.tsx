'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const AdminSidebar: FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
    { title: 'Sản phẩm', path: '/admin/products', icon: 'fas fa-box' },
    { title: 'Danh mục', path: '/admin/categories', icon: 'fas fa-tags' },
    { title: 'Đơn hàng', path: '/admin/orders', icon: 'fas fa-shopping-cart' },
    { title: 'Người dùng', path: '/admin/users', icon: 'fas fa-users' },
    { title: 'Bài viết', path: '/admin/posts', icon: 'fas fa-newspaper' },
    { title: 'Khuyến mãi', path: '/admin/promotions', icon: 'fas fa-percent' },
    { title: 'Cấu hình', path: '/admin/settings', icon: 'fas fa-cog' },
  ];

  const SidebarContent = () => (
    <div className="h-full bg-white border-r">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold text-green-600">Đông Y Admin</span>
        </Link>
      </div>
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <li key={index}>
                <Link 
                  href={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-green-50 text-green-600 border-r-4 border-green-600' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                  <span className="font-medium">{item.title}</span>
                </Link>
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