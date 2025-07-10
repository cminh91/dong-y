'use client';

import Link from 'next/link';
import { FC } from 'react';
import { CategoryWithChildren, SystemSetting } from '@/types/api';

interface FooterProps {
  productCategories?: CategoryWithChildren[];
  contactInfo?: SystemSetting | null;
  loading?: boolean;
  error?: string | null;
}

const Footer: FC<FooterProps> = ({
  productCategories = [],
  contactInfo: apiContactInfo,
  loading = false,
  error = null
}) => {
  // API trả về object trực tiếp
  const contactInfo = apiContactInfo || {};
  console.log('Footer apiContactInfo:', apiContactInfo);
  console.log('Footer contactInfo:', contactInfo);

  // Default company info
  const companyTitle = "Công ty TNHH Thương mại và Dịch vụ EVOSEA";
  const companyDescription = "Chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tận tâm.";

  const policies = [
    { label: "Chính sách bảo mật", path: "/chinh-sach-bao-mat" },
    { label: "Điều khoản sử dụng", path: "/dieu-khoan-su-dung" },
    { label: "Chính sách đổi trả", path: "/chinh-sach-doi-tra" },
    { label: "Hướng dẫn mua hàng", path: "/huong-dan-mua-hang" }
  ];

  return (
    <footer className="relative overflow-hidden pt-16 pb-8">
      <div className="relative z-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">{companyTitle}</h3>
            <p className="text-gray-800 mb-4">{companyDescription}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-green-600">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-primary hover:text-green-600">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-primary hover:text-green-600">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-primary hover:text-green-600">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-800 hover:text-primary">Trang chủ</Link></li>
                <li><Link href="/san-pham" className="text-gray-800 hover:text-primary">Sản phẩm</Link></li>
                <li><Link href="/gioi-thieu" className="text-gray-800 hover:text-primary">Giới thiệu</Link></li>
                <li><Link href="/tin-tuc" className="text-gray-800 hover:text-primary">Bài viết</Link></li>
                <li><Link href="/lien-he" className="text-gray-800 hover:text-primary">Liên hệ</Link></li>
              </ul>
            </div>
          </div>
          
          <div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary">Danh mục sản phẩm</h3>
              <ul className="space-y-2">
                {productCategories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <Link href={`/san-pham/danh-muc/${category.slug}`} className="text-gray-800 hover:text-primary">
                      {category.name}
                    </Link>
                  </li>
                ))}
                {productCategories.length === 0 && (
                  <li className="text-gray-500 text-sm">Đang tải...</li>
                )}
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              {(contactInfo as any)?.address && (
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                  <span className="text-gray-800">{(contactInfo as any).address}</span>
                </li>
              )}
              {(contactInfo as any)?.phone && (
                <li className="flex items-center">
                  <i className="fas fa-phone-alt text-primary mr-3"></i>
                  <span className="text-gray-800">{(contactInfo as any).phone}</span>
                </li>
              )}
              {(contactInfo as any)?.email && (
                <li className="flex items-center">
                  <i className="fas fa-envelope text-primary mr-3"></i>
                  <span className="text-gray-800">{(contactInfo as any).email}</span>
                </li>
              )}
              {(contactInfo as any)?.workingHours && (
                <li className="flex items-center">
                  <i className="fas fa-clock text-primary mr-3"></i>
                  <span className="text-gray-800">{(contactInfo as any).workingHours}</span>
                </li>
              )}
              {(contactInfo as any)?.facebookUrl && (
                <li className="flex items-center">
                  <i className="fab fa-facebook text-primary mr-3"></i>
                  <a href={(contactInfo as any).facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-primary">
                    Facebook
                  </a>
                </li>
              )}
              {(contactInfo as any)?.youtubeUrl && (
                <li className="flex items-center">
                  <i className="fab fa-youtube text-primary mr-3"></i>
                  <a href={(contactInfo as any).youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-primary">
                    YouTube
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-800 mb-4 md:mb-0">© 2025 Thiết kế bởi EVOSEA. Tất cả quyền được bảo lưu.</p>
            <div className="flex space-x-4">
              {policies?.map((policy) => (
                <Link key={policy.label} href={policy.path} className="text-gray-800 hover:text-primary">
                  {policy.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to top button */}
      <div id="back-to-top" className="fixed bottom-8 right-8 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-50 opacity-0 transition-opacity duration-300">
        <i className="fas fa-arrow-up"></i>
      </div>
      <div className="absolute inset-0 w-full h-full bg-white/17 z-10"></div>
      {/* Đã xóa video footer */}
    </footer>
  );
};

export default Footer;