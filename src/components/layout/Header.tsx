'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import layoutData from '@/data/layout.json';
import { FC } from 'react';
import { HeaderData } from '@/types/layout';

// Thay đổi interface HeaderProps thành:
interface HeaderProps extends Partial<HeaderData> {
  onSearch?: (searchTerm: string) => void;
}

const Header: FC<HeaderProps> = (props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const defaultProps = {
    ...layoutData.header,
    ...props
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoggedIn, userName, cartItemCount, productCategories, blogCategories, aboutCategories } = defaultProps;
  const balance = 0;

  const handleSearch = (term: string) => {
    console.log('Tìm kiếm:', term);
  };

  return (
    <header className="bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-green-50 py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span><i className="fas fa-phone-alt text-green-600 mr-2"></i>Hotline: 1900 1234</span>
            <span><i className="fas fa-envelope text-green-600 mr-2"></i>Email: contact@hepasaky.com</span>
          </div>
          <div className="flex items-center space-x-4">
            {mounted ? (
              isLoggedIn ? (
                <>
                  <span className="text-green-600 font-medium">
                    Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}
                  </span>
                  <Link href="/tai-khoan" className="flex items-center space-x-2 hover:text-green-600">
  <i className="fas fa-user-circle text-2xl text-green-600"></i>
  <span>{userName}</span>
</Link>

                </>
              ) : (
                <>
                  <Link href="/dang-nhap" className="hover:text-green-600">Đăng nhập</Link>
                  <span>|</span>
                  <Link href="/dang-ky" className="hover:text-green-600">Đăng ký</Link>
                </>
              )
            ) : (
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12 lg:w-14 lg:h-14">
              <Image
                src="/images/logo.jpg"
                alt="HepaSaky Gold"
                width={100}
                height={100}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-blue-900">CÔNG TY TNHH THƯƠNG MẠI KND</span>
              <span className="text-xs lg:text-sm text-red-500">Thực phẩm bảo vệ sức khoẻ</span>
            </div>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="absolute right-0 top-0 h-full px-6 text-white bg-green-600 rounded-r-full hover:bg-green-700">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {/* Cart & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link href="/gio-hang" className="relative p-2">
              <i className="fas fa-shopping-cart text-xl text-gray-600"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden text-gray-600 hover:text-green-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        <nav className="border-t">
          <ul className="py-2">
            <li><Link href="/" className="block px-4 py-2 hover:bg-gray-50 text">Trang chủ</Link></li>
            <li><Link href="/san-phams" className="block px-4 py-2 hover:bg-gray-50">Sản phẩm</Link></li>
            <li><Link href="/gioi-thieu" className="block px-4 py-2 hover:bg-gray-50">Giới thiệu</Link></li>
            <li><Link href="/bai-viet" className="block px-4 py-2 hover:bg-gray-50">Bài viết</Link></li>
            <li><Link href="/lien-he" className="block px-4 py-2 hover:bg-gray-50">Liên hệ</Link></li>
            {mounted && isLoggedIn ? (
              <li><Link href="/tai-khoan" className="block px-4 py-2 hover:bg-gray-50">Tài khoản</Link></li>
            ) : (
              <>
                <li><Link href="/dang-nhap" className="block px-4 py-2 hover:bg-gray-50">Đăng nhập</Link></li>
                <li><Link href="/dang-ky" className="block px-4 py-2 hover:bg-gray-50">Đăng ký</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t">
        <ul className="flex items-center justify-center space-x-8 py-4">
          <li className="relative group">
            <Link href="/" className="py-2 hover:text-green-500">Trang chủ</Link>
          </li>

          <li className="relative group">
            <Link href="/san-phams" className="py-2 hover:text-green-500">Sản phẩm</Link>
            {productCategories.length > 0 && (
              <ul className="absolute top-full left-0 z-50 hidden group-hover:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                {productCategories.map((cat) => (
                  <li key={cat.id} className="relative group/sub">
                    <Link href={cat.path} className="block px-4 py-2 hover:bg-gray-50">
                      {cat.label}
                      {cat.children && <i className="fas fa-chevron-right float-right mt-1" />}
                    </Link>
                    {cat.children && (
                      <ul className="absolute top-0 left-full z-50 hidden group-hover/sub:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                        {cat.children.map((sub) => (
                          <li key={sub.id}>
                            <Link href={sub.path} className="block px-4 py-2 hover:bg-gray-50">
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="relative group">
            <Link href="/gioi-thieu" className="py-2 hover:text-green-500">Giới thiệu</Link>
            {Array.isArray(aboutCategories) && aboutCategories.length > 0 && (
              <ul className="absolute top-full left-0 z-50 hidden group-hover:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                {aboutCategories?.map((cat) => (
                  <li key={cat.id}>
                    <Link href={cat.path} className="block px-4 py-2 hover:bg-gray-50">
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="relative group">
            <Link href="/bai-viet" className="py-2 hover:text-green-500">Bài viết</Link>
            {blogCategories.length > 0 && (
              <ul className="absolute top-full left-0 z-50 hidden group-hover:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                {blogCategories.map((cat) => (
                  <li key={cat.id} className="relative group/sub">
                    <Link href={cat.path} className="block px-4 py-2 hover:bg-gray-50">
                      {cat.label}
                      {cat.children && <i className="fas fa-chevron-right float-right mt-1" />}
                    </Link>
                    {cat.children && (
                      <ul className="absolute top-0 left-full z-50 hidden group-hover/sub:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                        {cat.children.map((sub) => (
                          <li key={sub.id}>
                            <Link href={sub.path} className="block px-4 py-2 hover:bg-gray-50">
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="relative group">
            <Link href="/lien-he" className="py-2 hover:text-green-500">Liên hệ</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;