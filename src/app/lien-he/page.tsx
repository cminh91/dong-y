"use client"
import { FC } from 'react';
import Link from 'next/link';
import ContactSection from '@/components/home/ContactSection';

const ContactPage: FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">Liên hệ</li>
        </ol>
      </nav>

      <ContactSection />

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Câu Hỏi Thường Gặp</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <button className="flex justify-between items-center w-full text-left">
              <span className="font-medium">Làm thế nào để đặt hàng trên website?</span>
              <i className="fas fa-chevron-down text-primary"></i>
            </button>
            <div className="mt-4 text-gray-600">
              <p>Để đặt hàng trên website, bạn có thể thực hiện theo các bước sau:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                <li>Kiểm tra giỏ hàng và tiến hành thanh toán</li>
                <li>Điền thông tin giao hàng</li>
                <li>Chọn phương thức thanh toán</li>
                <li>Xác nhận đơn hàng</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <button className="flex justify-between items-center w-full text-left">
              <span className="font-medium">Phí vận chuyển được tính như thế nào?</span>
              <i className="fas fa-chevron-down text-primary"></i>
            </button>
            <div className="mt-4 text-gray-600">
              <p>Phí vận chuyển được tính dựa trên khoảng cách và trọng lượng đơn hàng. Đơn hàng trên 500.000đ sẽ được miễn phí vận chuyển trong nội thành TP.HCM. Đối với các tỉnh thành khác, phí vận chuyển sẽ được hiển thị khi bạn tiến hành thanh toán.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <button className="flex justify-between items-center w-full text-left">
              <span className="font-medium">Tôi có thể thanh toán bằng những phương thức nào?</span>
              <i className="fas fa-chevron-down text-primary"></i>
            </button>
            <div className="mt-4 text-gray-600">
              <p>Chúng tôi chấp nhận các phương thức thanh toán sau:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Thanh toán khi nhận hàng (COD)</li>
                <li>Chuyển khoản ngân hàng</li>
                <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)</li>
                <li>Ví điện tử (Momo, ZaloPay, VNPay)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/faq" className="text-primary hover:underline inline-flex items-center">
            Xem tất cả câu hỏi thường gặp
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;