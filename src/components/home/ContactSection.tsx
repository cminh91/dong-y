'use client';

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

interface ContactData {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  mapUrl: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const ContactSection: FC = () => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('/api/contact-section');
        if (response.ok) {
          const data = await response.json();
          setContactData(data);
        }
      } catch (error) {
        console.error('Failed to fetch contact data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-16">Đang tải thông tin liên hệ...</div>;
  }

  if (!contactData) {
    return <div className="text-center py-16">Không thể tải được thông tin liên hệ.</div>;
  }

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Có bất kỳ câu hỏi nào? Chúng tôi muốn nghe từ bạn. Hãy liên hệ với chúng tôi và chúng tôi sẽ sớm trả lời.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-white p-8 rounded-lg shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-6 text-primary">Thông Tin Liên Hệ</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-primary mt-1 mr-4 text-xl"></i>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Trụ sở chính</h3>
                    <p className="text-gray-600">{contactData.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <i className="fas fa-phone-alt text-primary mt-1 mr-4 text-xl"></i>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Điện thoại</h3>
                    <p className="text-gray-600">{contactData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <i className="fas fa-envelope text-primary mt-1 mr-4 text-xl"></i>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Email</h3>
                    <p className="text-gray-600">{contactData.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <i className="fas fa-clock text-primary mt-1 mr-4 text-xl"></i>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">{contactData.workingHours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-lg mb-4">Kết nối với chúng tôi</h3>
                <div className="flex space-x-4">
                  {contactData.facebookUrl && (
                    <a href={contactData.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                  {contactData.twitterUrl && (
                    <a href={contactData.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  {contactData.instagramUrl && (
                    <a href={contactData.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <i className="fab fa-instagram"></i>
                    </a>
                  )}
                  {contactData.youtubeUrl && (
                    <a href={contactData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <i className="fab fa-youtube"></i>
                    </a>
                  )}
                  {contactData.linkedinUrl && (
                    <a href={contactData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <form className="bg-white p-8 rounded-lg shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-6 text-primary">Gửi Tin Nhắn Cho Chúng Tôi</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Chủ đề</label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="product">Thông tin sản phẩm</option>
                  <option value="order">Đơn hàng</option>
                  <option value="support">Hỗ trợ kỹ thuật</option>
                  <option value="feedback">Góp ý, phản hồi</option>
                  <option value="cooperation">Hợp tác kinh doanh</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Nội dung <span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập nội dung tin nhắn"
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" required />
                  <span className="text-gray-700">Tôi đồng ý với <Link href="/policies/privacy" className="text-primary hover:underline">chính sách bảo mật</Link> của Đông Y Pharmacy</span>
                </label>
              </div>

              <button type="submit" className="bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-green-600 transition-colors w-full">
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {contactData.mapUrl && (
        <div className="mt-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">Bản Đồ</h2>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="aspect-w-16 aspect-h-9" dangerouslySetInnerHTML={{ __html: contactData.mapUrl }}>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default ContactSection;