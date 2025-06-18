'use client';

import Link from 'next/link';
import { FC } from 'react';
import layoutData from '@/data/layout.json';
import { FooterData } from '@/types/layout';

const Footer: FC<Partial<FooterData>> = (props) => {
  const defaultProps = {
    ...layoutData.footer,
    ...props
  };

  const {
    companyTitle,
    companyDescription,
    contactInfo,
    workingHours,
    policies
  } = defaultProps;

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
                {layoutData.header.productCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={cat.path} className="text-gray-800 hover:text-primary">
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                <span className="text-gray-800">{contactInfo.address}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt text-primary mr-3"></i>
                <span className="text-gray-800">{contactInfo.phone.join(' - ')}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope text-primary mr-3"></i>
                <span className="text-gray-800">{contactInfo.email}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-globe text-primary mr-3"></i>
                <span className="text-gray-800">{contactInfo.website}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-industry text-primary mt-1 mr-3"></i>
                <span className="text-gray-800">Sản xuất tại: {contactInfo.manufacturer?.name}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-map-marked-alt text-primary mt-1 mr-3"></i>
                <span className="text-gray-800">{contactInfo.manufacturer?.address}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-flag text-primary mr-3"></i>
                <span className="text-gray-800">Xuất xứ: {contactInfo.origin}</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock text-primary mr-3"></i>
                <span className="text-gray-800">{workingHours}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-800 mb-4 md:mb-0">© 2025 Thiết kế bởi EVOSEA. Tất cả quyền được bảo lưu.</p>
            <div className="flex space-x-4">
              {policies?.map((policy) => (
                <Link key={policy.name} href={policy.url} className="text-gray-800 hover:text-primary">
                  {policy.name}
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