'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderDetail {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: any;
  notes: string;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
      sku: string;
      stock: number;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
  itemCount: number;
  totalQuantity: number;
}

const OrderDetailPage: FC = () => {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      console.log('Fetching order:', orderId);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('API result:', result);

      if (result.success) {
        const orderData = result.data.order;
        // Safely parse product images which might be a JSON string
        if (orderData.orderItems) {
          orderData.orderItems.forEach((item: OrderDetail['orderItems'][0]) => {
            if (item.product && typeof item.product.images === 'string') {
              try {
                const parsedImages = JSON.parse(item.product.images);
                item.product.images = Array.isArray(parsedImages) ? parsedImages : [];
              } catch (e) {
                console.error("Failed to parse product images:", item.product.images, e);
                item.product.images = [];
              }
            } else if (item.product && !item.product.images) {
              item.product.images = [];
            }
          });
        }

        setOrder(orderData);
      } else {
        console.error('Failed to fetch order:', result.error);
        alert('Không thể tải thông tin đơn hàng: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Có lỗi xảy ra khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);


  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPING':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Không tìm thấy đơn hàng</p>
          <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-2xl font-bold mt-2">Chi tiết đơn hàng #{order.orderNumber}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status === 'PENDING' && 'Chờ xử lý'}
                  {order.status === 'CONFIRMED' && 'Đã xác nhận'}
                  {order.status === 'PROCESSING' && 'Đang xử lý'}
                  {order.status === 'SHIPPING' && 'Đang giao'}
                  {order.status === 'DELIVERED' && 'Đã giao'}
                  {order.status === 'CANCELLED' && 'Đã hủy'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus === 'PENDING' && 'Chờ thanh toán'}
                  {order.paymentStatus === 'PAID' && 'Đã thanh toán'}
                  {order.paymentStatus === 'FAILED' && 'Thất bại'}
                  {order.paymentStatus === 'REFUNDED' && 'Đã hoàn tiền'}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Ngày đặt:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}
              </div>
              <div>
                <span className="font-medium">Cập nhật:</span> {new Date(order.updatedAt).toLocaleString('vi-VN')}
              </div>
              {order.trackingNumber && (
                <div className="col-span-2">
                  <span className="font-medium">Mã vận đơn:</span> {order.trackingNumber}
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                    <p className="text-sm text-gray-600">Giá: {item.price.toLocaleString('vi-VN')}₫</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">x{item.quantity}</p>
                    <p className="text-sm text-gray-600">{item.total.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                <p className="text-sm">{order.user.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm">{order.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <p className="text-sm">{order.user.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <p className="text-sm">{order.user.address}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{order.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee.toLocaleString('vi-VN')}₫</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{order.discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng cộng:</span>
                <span>{order.finalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="text-sm text-gray-600">
                <span>Phương thức thanh toán: </span>
                <span className="font-medium">
                  {order.paymentMethod === 'COD' && 'Thanh toán khi nhận hàng'}
                  {order.paymentMethod === 'BANK_TRANSFER' && 'Chuyển khoản ngân hàng'}
                  {order.paymentMethod === 'CREDIT_CARD' && 'Thẻ tín dụng'}
                  {order.paymentMethod === 'E_WALLET' && 'Ví điện tử'}
                  {order.paymentMethod === 'MOMO' && 'MoMo'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OrderDetailPage;
