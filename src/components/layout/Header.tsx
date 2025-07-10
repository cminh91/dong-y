'use client';

import { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { logoutAction } from '@/lib/auth-actions'
import { CategoryWithChildren, PostCategory, SystemSetting } from '@/types/api'

interface UserData {
  role?: 'ADMIN' | 'COLLABORATOR' | 'AGENT' | 'USER'
  fullName?: string
  email?: string
  availableBalance?: number
}

interface HeaderProps {
  productCategories?: CategoryWithChildren[]
  blogCategories?: PostCategory[]
  aboutCategories?: any[]
  contactInfo?: SystemSetting | null
  cartItemCount?: number
  onSearch?: (searchTerm: string) => void
  loading?: boolean
  error?: string | null
}

const Header: FC<HeaderProps> = ({
  productCategories = [],
  blogCategories = [],
  aboutCategories = [],
  contactInfo,
  cartItemCount = 0,
  onSearch,
  loading = false,
  error = null
}) => {
  const router = useRouter();

  // Parse contact info - API trả về object trực tiếp
  const contact = contactInfo || {};
  console.log('Header contactInfo:', contactInfo);
  console.log('Header contact:', contact);

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('Header mounted, fetching user data...');
    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const result = await response.json();
        console.log('User profile API response:', result); // Debug log
        if (result.success && result.profile) {
          setUser(result.profile);
        } else {
          setUser(null);
        }
      } else {
        console.log('Profile API failed:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logoutAction()
  }

  // Props are already destructured in function parameters
  const isLoggedIn = !!user
  const userName = user?.fullName || '';
  const balance = user?.availableBalance || 0;

  const handleSearch = (term: string) => {
    console.log('Tìm kiếm:', term);
  };

  return (
    <>
      <style jsx>{`
        .user-dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-menu {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
      <header className="bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-green-50 py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            {(contact as any)?.phone && (
              <span><i className="fas fa-phone-alt text-green-600 mr-2"></i>Hotline: {(contact as any).phone}</span>
            )}
            {(contact as any)?.email && (
              <span><i className="fas fa-envelope text-green-600 mr-2"></i>Email: {(contact as any).email}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {mounted ? (
              isUserLoading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : isLoggedIn ? (
                <>
                  {/* Hiển thị số dư cho affiliate */}
                  {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                    <span className="text-green-600 font-medium">
                      Số dư: {balance.toLocaleString('vi-VN')}₫
                    </span>
                  )}

                  {/* User dropdown */}
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-2 hover:text-green-600 py-2 px-3 rounded-lg transition-colors"
                    >
                      <i className="fas fa-user-circle text-2xl text-green-600"></i>
                      <span>{userName}</span>
                      <i className={`fas fa-chevron-down text-xs transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{userName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        {user?.role === 'ADMIN' ? (
                          <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i className="fas fa-cog mr-3 w-4 text-center"></i>
                            Quản trị hệ thống
                          </Link>
                        ) : (
                          <>
                            <Link href="/tai-khoan" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <i className="fas fa-user mr-3 w-4 text-center"></i>
                              Tài khoản của tôi
                            </Link>

                            <Link href="/tai-khoan/don-hang" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <i className="fas fa-shopping-bag mr-3 w-4 text-center"></i>
                              Đơn hàng của tôi
                            </Link>

                            {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                              <>
                                <Link href="/tai-khoan/affiliate" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                  <i className="fas fa-chart-line mr-3 w-4 text-center"></i>
                                  Affiliate Dashboard
                                </Link>
                                <Link href="/tai-khoan/affiliate/withdrawals" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                  <i className="fas fa-money-bill-wave mr-3 w-4 text-center"></i>
                                  Rút tiền
                                </Link>
                              </>
                            )}
                          </>
                        )}

                        <hr className="my-2 border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-sign-out-alt mr-3 w-4 text-center"></i>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/dang-nhap" className="hover:text-green-600 transition-colors">
                    <i className="fas fa-sign-in-alt mr-1"></i>
                    Đăng nhập
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/dang-ky" className="hover:text-green-600 transition-colors">
                    <i className="fas fa-user-plus mr-1"></i>
                    Đăng ký
                  </Link>
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
          {/* Left Side: Mobile Menu Button + Logo */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <div className="lg:hidden mr-3">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-gray-600 hover:text-green-600">
                    <i className="fas fa-bars text-2xl"></i>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                  <div className="h-full flex flex-col">
                    {/* Hiển thị thông tin người dùng và số dư nếu đã đăng nhập */}
                    {mounted && !isUserLoading && isLoggedIn && (
                      <div className="px-4 py-3 bg-green-50 border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white"></i>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{userName}</div>
                            <div className="text-xs text-gray-500">{user?.email}</div>
                            {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                              <div className="text-green-600 text-sm font-medium">
                                Số dư: {balance.toLocaleString('vi-VN')}₫
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tìm kiếm */}
                    <div className="px-4 py-3 bg-gray-50 border-b">
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

                    {/* Menu items */}
                    <nav className="flex-1 overflow-y-auto">
                      <ul className="py-2">
                        <li><Link href="/" className="block px-4 py-2 hover:bg-gray-50">Trang chủ</Link></li>

                        {/* Product Categories */}
                        <li className="relative">
                          <Link href="/san-pham" className="block px-4 py-2 hover:bg-gray-50">Sản phẩm</Link>
                          {productCategories.length > 0 && (
                            <ul className="ml-4">
                              {productCategories.slice(0, 5).map((category) => (
                                <li key={category.id}>
                                  <Link
                                    href={`/san-pham?category=${category.slug}`}
                                    className="block px-4 py-1 text-sm text-gray-600 hover:bg-gray-50"
                                  >
                                    {category.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>

                        <li><Link href="/gioi-thieu" className="block px-4 py-2 hover:bg-gray-50">Giới thiệu</Link></li>

                        {/* Blog Categories */}
                        <li className="relative">
                          <Link href="/bai-viet" className="block px-4 py-2 hover:bg-gray-50">Bài viết</Link>
                          {blogCategories.length > 0 && (
                            <ul className="ml-4">
                              {blogCategories.slice(0, 5).map((category) => (
                                <li key={category.id}>
                                  <Link
                                    href={`/bai-viet?category=${category.slug}`}
                                    className="block px-4 py-1 text-sm text-gray-600 hover:bg-gray-50"
                                  >
                                    {category.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>

                        <li><Link href="/lien-he" className="block px-4 py-2 hover:bg-gray-50">Liên hệ</Link></li>

                        {mounted && !isUserLoading && isLoggedIn ? (
                          <>
                            {user?.role === 'ADMIN' ? (
                              <li><Link href="/admin" className="block px-4 py-2 hover:bg-gray-50">
                                <i className="fas fa-cog mr-2"></i>Quản trị
                              </Link></li>
                            ) : (
                              <>
                                <li><Link href="/tai-khoan" className="block px-4 py-2 hover:bg-gray-50">
                                  <i className="fas fa-user mr-2"></i>Tài khoản
                                </Link></li>
                                <li><Link href="/tai-khoan/don-hang" className="block px-4 py-2 hover:bg-gray-50">
                                  <i className="fas fa-shopping-bag mr-2"></i>Đơn hàng
                                </Link></li>
                                {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                                  <li><Link href="/tai-khoan/affiliate" className="block px-4 py-2 hover:bg-gray-50">
                                    <i className="fas fa-chart-line mr-2"></i>Affiliate
                                  </Link></li>
                                )}
                              </>
                            )}
                            <li>
                              <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                              >
                                <i className="fas fa-sign-out-alt mr-2"></i>Đăng xuất
                              </button>
                            </li>
                          </>
                        ) : (
                          <>
                            <li><Link href="/dang-nhap" className="block px-4 py-2 hover:bg-gray-50">
                              <i className="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                            </Link></li>
                            <li><Link href="/dang-ky" className="block px-4 py-2 hover:bg-gray-50">
                              <i className="fas fa-user-plus mr-2"></i>Đăng ký
                            </Link></li>
                          </>
                        )}
                      </ul>
                    </nav>

                    {/* Footer */}
                    <div className="border-t py-4 px-4">
                      <div className="text-sm text-gray-500">
                        <div className="mb-2"><i className="fas fa-phone-alt mr-2"></i>Hotline: 1900 1234</div>
                        <div><i className="fas fa-envelope mr-2"></i>Email: contact@hepasaky.com</div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
          </div>

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

          {/* Cart & Balance */}
          <div className="flex items-center space-x-4">
            {/* Hiển thị icon người dùng trên mobile */}
            {mounted && !isUserLoading && isLoggedIn && (
              <div className="lg:hidden">
                <Link href="/tai-khoan" className="block p-2 relative">
                  <i className="fas fa-user text-xl text-green-600"></i>
                  {(user?.role === 'COLLABORATOR' || user?.role === 'AGENT') && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </Link>
              </div>
            )}

            <Link href="/gio-hang" className="relative p-2">
              <i className="fas fa-shopping-cart text-xl text-gray-600"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t">
        <ul className="flex items-center justify-center space-x-8 py-4">
          <li className="relative group">
            <Link href="/" className="py-2 hover:text-green-500">Trang chủ</Link>
          </li>

          <li className="relative group">
            <Link href="/san-pham" className="py-2 hover:text-green-500">Sản phẩm</Link>
            {productCategories.length > 0 && (
              <ul className="absolute top-full left-0 z-50 hidden group-hover:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                {productCategories.map((category) => (
                  <li key={category.id} className="relative group/sub">
                    <Link href={`/san-pham?category/${category.slug}`} className="block px-4 py-2 hover:bg-gray-50">
                      {category.name}
                      {category.children && category.children.length > 0 && <i className="fas fa-chevron-right float-right mt-1" />}
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <ul className="absolute top-0 left-full z-50 hidden group-hover/sub:block bg-white shadow-lg rounded-lg py-2 min-w-[200px]">
                        {category.children.map((subCategory) => (
                          <li key={subCategory.id}>
                            <Link href={`/san-pham?category/${subCategory.slug}`} className="block px-4 py-2 hover:bg-gray-50">
                              {subCategory.name}
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
                {aboutCategories?.map((cat: any) => (
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
                {blogCategories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/bai-viet?category=${category.slug}`} className="block px-4 py-2 hover:bg-gray-50">
                      {category.name}
                    </Link>
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
    </>
  );
};

export default Header;