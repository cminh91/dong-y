'use client';

import { FC, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, CreditCard, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderDetails {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

const PaymentSuccessPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Mock session data for development
  const session = { user: { id: '1', name: 'Test User', email: 'test@example.com' } };
  const status = 'authenticated';
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const resultCode = searchParams.get('resultCode');

  useEffect(() => {
    console.log('PaymentSuccessPage - orderId:', orderId);
    console.log('PaymentSuccessPage - status:', status);

    if (status === 'unauthenticated') {
      router.push('/dang-nhap');
      return;
    }

    if (!orderId) {
      console.log('PaymentSuccessPage - No orderId found');
      setError('Không tìm thấy thông tin đơn hàng');
      setLoading(false);
      return;
    }

    console.log('PaymentSuccessPage - Fetching order details for:', orderId);
    fetchOrderDetails();
  }, [orderId, status, router]);

  const fetchOrderDetails = async () => {
    try {
      console.log('PaymentSuccessPage - Fetching from API:', `/api/orders/${orderId}`);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      console.log('PaymentSuccessPage - API response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải thông tin đơn hàng');
      }

      console.log('PaymentSuccessPage - Order details loaded:', data.order);
      setOrderDetails(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'MOMO':
        return 'Ví MoMo';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      default:
        return method;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'PAID':
        return 'Đã thanh toán';
      case 'FAILED':
        return 'Thanh toán thất bại';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
            <Button onClick={() => router.push('/')} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccess = resultCode === '0' || orderDetails.paymentStatus === 'PAID' || orderDetails.paymentMethod === 'COD';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <Card className="mb-8">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              {isPaymentSuccess ? 'Đặt hàng thành công!' : 'Đơn hàng đã được tạo'}
            </h1>
            <p className="text-gray-600 mb-4">
              {isPaymentSuccess 
                ? 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.'
                : 'Đơn hàng đã được tạo. Vui lòng hoàn tất thanh toán để xử lý đơn hàng.'}
            </p>
            <div className="bg-gray-100 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="text-xl font-bold text-green-600">{orderDetails.code}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      {item.subtotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{orderDetails.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{orderDetails.shippingFee.toLocaleString('vi-VN')}₫</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {orderDetails.totalAmount.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{orderDetails.customerName}</p>
                  <p className="text-gray-600">{orderDetails.customerPhone}</p>
                  <p className="text-gray-600">{orderDetails.customerEmail}</p>
                </div>
                <div>
                  <p className="font-medium">Địa chỉ giao hàng:</p>
                  <p className="text-gray-600">{orderDetails.shippingAddress}</p>
                </div>
                {orderDetails.notes && (
                  <div>
                    <p className="font-medium">Ghi chú:</p>
                    <p className="text-gray-600">{orderDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span className="font-medium">
                    {getPaymentMethodText(orderDetails.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái thanh toán:</span>
                  <span className={`font-medium ${
                    orderDetails.paymentStatus === 'PAID' 
                      ? 'text-green-600' 
                      : orderDetails.paymentStatus === 'FAILED'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {getPaymentStatusText(orderDetails.paymentStatus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái đơn hàng:</span>
                  <span className="font-medium text-blue-600">
                    {getStatusText(orderDetails.status)}
                  </span>
                </div>
                {paymentId && (
                  <div className="flex justify-between">
                    <span>Mã giao dịch:</span>
                    <span className="font-medium text-gray-600">{paymentId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Bước tiếp theo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderDetails.paymentMethod === 'COD' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      • Đơn hàng sẽ được xác nhận trong vòng 24 giờ
                    </p>
                    <p className="text-sm text-gray-600">
                      • Bạn sẽ nhận được cuộc gọi xác nhận từ nhân viên
                    </p>
                    <p className="text-sm text-gray-600">
                      • Thanh toán khi nhận hàng
                    </p>
                  </div>
                ) : orderDetails.paymentStatus === 'PAID' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      • Đơn hàng đã được thanh toán thành công
                    </p>
                    <p className="text-sm text-gray-600">
                      • Đơn hàng sẽ được xử lý và giao trong 2-3 ngày
                    </p>
                    <p className="text-sm text-gray-600">
                      • Bạn sẽ nhận được thông báo khi hàng được giao
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      • Vui lòng hoàn tất thanh toán để xử lý đơn hàng
                    </p>
                    <p className="text-sm text-gray-600">
                      • Đơn hàng sẽ bị hủy nếu không thanh toán trong 24 giờ
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button 
            onClick={() => router.push('/tai-khoan/don-hang')}
            variant="outline"
            size="lg"
          >
            Xem đơn hàng của tôi
          </Button>
          <Button 
            onClick={() => router.push('/')}
            size="lg"
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PaymentSuccessPageWithSuspense() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}