'use client';

import { FC } from 'react';

const SettingsPage: FC = () => {
  // Trong thực tế, dữ liệu này sẽ được lấy từ API
  const settings = {
    general: {
      siteName: 'Đông Y Pharmacy',
      siteDescription: 'Cung cấp các sản phẩm đông y chất lượng cao',
      contactEmail: 'contact@dongypharmacy.com',
      contactPhone: '0901234567',
      address: '123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
      logo: '/images/logo.jpg',
      favicon: '/favicon.ico'
    },
    social: {
      facebook: 'https://facebook.com/dongypharmacy',
      instagram: 'https://instagram.com/dongypharmacy',
      youtube: 'https://youtube.com/dongypharmacy',
      twitter: ''
    },
    shipping: {
      freeShippingThreshold: 500000,
      defaultShippingFee: 30000,
      shippingMethods: [
        { id: 1, name: 'Giao hàng tiêu chuẩn', fee: 30000, estimatedDays: '2-3 ngày' },
        { id: 2, name: 'Giao hàng nhanh', fee: 50000, estimatedDays: '1-2 ngày' }
      ]
    },
    payment: {
      methods: [
        { id: 1, name: 'Thanh toán khi nhận hàng (COD)', isActive: true },
        { id: 2, name: 'Chuyển khoản ngân hàng', isActive: true },
        { id: 3, name: 'Ví điện tử (MoMo)', isActive: false },
        { id: 4, name: 'Thẻ tín dụng/ghi nợ', isActive: false }
      ],
      bankAccounts: [
        { bank: 'Vietcombank', accountNumber: '1234567890', accountName: 'CONG TY DONG Y PHARMACY' },
        { bank: 'Techcombank', accountNumber: '0987654321', accountName: 'CONG TY DONG Y PHARMACY' }
      ]
    },
    seo: {
      metaTitle: 'Đông Y Pharmacy - Cung cấp các sản phẩm đông y chất lượng cao',
      metaDescription: 'Đông Y Pharmacy cung cấp các sản phẩm đông y chất lượng cao, thuốc bổ, dược liệu, gia vị đông y và các sản phẩm chăm sóc sức khỏe từ thảo dược.',
      metaKeywords: 'đông y, thuốc bổ, dược liệu, gia vị đông y, thảo dược, sức khỏe'
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Cài đặt hệ thống</h1>

      {/* Thông tin chung */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Thông tin chung</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên website</label>
              <input
                type="text"
                defaultValue={settings.general.siteName}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả website</label>
              <input
                type="text"
                defaultValue={settings.general.siteDescription}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
              <input
                type="email"
                defaultValue={settings.general.contactEmail}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                defaultValue={settings.general.contactPhone}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                defaultValue={settings.general.address}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mạng xã hội */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Mạng xã hội</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                defaultValue={settings.social.facebook}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                defaultValue={settings.social.instagram}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Youtube</label>
              <input
                type="url"
                defaultValue={settings.social.youtube}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="url"
                defaultValue={settings.social.twitter}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vận chuyển */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Cài đặt vận chuyển</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn hàng miễn phí vận chuyển</label>
              <input
                type="number"
                defaultValue={settings.shipping.freeShippingThreshold}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phí vận chuyển mặc định</label>
              <input
                type="number"
                defaultValue={settings.shipping.defaultShippingFee}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Phương thức vận chuyển</h3>
            {settings.shipping.shippingMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-md mb-3">
                <div>
                  <h4 className="font-medium">{method.name}</h4>
                  <p className="text-sm text-gray-500">Thời gian: {method.estimatedDays}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{method.fee.toLocaleString()}₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thanh toán */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Cài đặt thanh toán</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</h3>
            {settings.payment.methods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-md mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={method.isActive}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-3">{method.name}</label>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tài khoản ngân hàng</h3>
            {settings.payment.bankAccounts.map((account, index) => (
              <div key={index} className="p-4 border rounded-md mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Ngân hàng</label>
                    <input
                      type="text"
                      defaultValue={account.bank}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Số tài khoản</label>
                    <input
                      type="text"
                      defaultValue={account.accountNumber}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Tên tài khoản</label>
                    <input
                      type="text"
                      defaultValue={account.accountName}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Cài đặt SEO</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                defaultValue={settings.seo.metaTitle}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                defaultValue={settings.seo.metaDescription}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                defaultValue={settings.seo.metaKeywords}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nút lưu */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => {
            alert('Đã lưu thay đổi thành công!');
          }}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;