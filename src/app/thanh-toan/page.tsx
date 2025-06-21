'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { MoMoPayment } from '@/components/payment/momo-payment';
import { BankTransferPayment } from '@/components/payment/bank-transfer';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

const CheckoutPage: FC = () => {
  // Mock session data for development
  const session = { user: { id: '1', name: 'Test User', email: 'test@example.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const { state, clearCart, syncToServer, hasPendingChanges } = useCart();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [discount, setDiscount] = useState(0);

  // Get affiliate parameters from URL
  const [affiliateParams, setAffiliateParams] = useState<{
    affiliateSlug?: string;
    referralCode?: string;
  }>({});

  useEffect(() => {
    // Get affiliate parameters from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const aff = urlParams.get('aff');
    const ref = urlParams.get('ref');

    // Also check localStorage for persistent affiliate tracking
    const storedAff = localStorage.getItem('affiliateSlug');
    const storedRef = localStorage.getItem('referralCode');

    // DEBUG: Log affiliate tracking data
    console.log('=== CHECKOUT AFFILIATE TRACKING DEBUG ===');
    console.log('URL aff:', aff);
    console.log('URL ref:', ref);
    console.log('localStorage affiliateSlug:', storedAff);
    console.log('localStorage referralCode:', storedRef);

    const finalParams = {
      affiliateSlug: aff || storedAff || undefined,
      referralCode: ref || storedRef || undefined
    };

    console.log('Final affiliate params:', finalParams);
    setAffiliateParams(finalParams);
  }, []);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/dang-nhap?redirect=/thanh-toan');
    }
  }, [status, router]);

  useEffect(() => {
    // Redirect to cart if no items
    if (state.items.length === 0) {
      router.push('/gio-hang');
    }
  }, [state.items.length, router]);

  // Calculate totals
  const subtotal = state.total;
  const discountAmount = subtotal * discount;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal - discountAmount + shippingFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, address } = formData;
    if (!fullName || !phoneNumber || !email || !address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return false;
    }
    if (!selectedPaymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Sync cart to server before creating order
      if (hasPendingChanges) {
        toast.info('Đang đồng bộ giỏ hàng với server...');
        await syncToServer(); // Sync cart to server
      }


      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: state.items.map(item => ({
            id: item.id,
            productId: item.productId || item.id, // Ensure productId is sent
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: subtotal,
          discount: discountAmount,
          shippingFee: shippingFee,
          finalTotal: total,
          paymentMethod: selectedPaymentMethod.toUpperCase(),
          // Include affiliate tracking
          affiliateSlug: affiliateParams.affiliateSlug,
          referralCode: affiliateParams.referralCode,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo đơn hàng');
      }

      setCurrentOrderId(data.orderId);
      toast.success('Tạo đơn hàng thành công!');

      // Clear cart after successful order
      clearCart();

      // Redirect đến trang thành công cho tất cả payment methods
      const successUrl = `/thanh-toan/thanh-cong?orderId=${data.orderId}&paymentMethod=${selectedPaymentMethod}`;
      console.log('Redirecting to:', successUrl);

      // Force redirect with window.location as fallback
      try {
        router.push(successUrl);
        // Fallback redirect after 1 second if router.push doesn't work
        setTimeout(() => {
          if (window.location.pathname !== '/thanh-toan/thanh-cong') {
            window.location.href = successUrl;
          }
        }, 1000);
      } catch (error) {
        console.error('Router push failed, using window.location:', error);
        window.location.href = successUrl;
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Thanh toán thành công!');
    // Redirect đến trang thành công với payment info
    if (currentOrderId) {
      router.push(`/thanh-toan/thanh-cong?orderId=${currentOrderId}&paymentId=${paymentId}&resultCode=0`);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Lỗi thanh toán: ${error}`);
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form thông tin giao hàng */}
        <div className="lg:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng chi tiết"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Ghi chú về đơn hàng (tùy chọn)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            onMethodSelect={setSelectedPaymentMethod}
            selectedMethod={selectedPaymentMethod}
            disabled={loading}
          />

          {/* Payment Components */}
          {currentOrderId && selectedPaymentMethod === 'momo' && (
            <MoMoPayment
              orderId={currentOrderId}
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {currentOrderId && selectedPaymentMethod === 'bank_transfer' && (
            <BankTransferPayment
              orderId={currentOrderId}
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>

        {/* Tổng quan đơn hàng */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
                {shippingFee === 0 && subtotal >= 500000 && (
                  <p className="text-xs text-green-600">
                    🎉 Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {!currentOrderId ? (
                  <Button 
                    onClick={createOrder}
                    disabled={loading || !selectedPaymentMethod}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt hàng'
                    )}
                  </Button>
                ) : (
                  <div className="text-center text-green-600 font-medium">
                    ✓ Đơn hàng đã được tạo
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push('/gio-hang')}
                  disabled={loading}
                >
                  Quay lại giỏ hàng
                </Button>
              </div>

              {/* Terms and Policies */}
              <div className="pt-4 text-sm text-gray-600 space-y-2">
                <p>
                  Bằng việc tiến hành đặt hàng, bạn đồng ý với{' '}
                  <Link href="/dieu-khoan" className="text-green-600 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/chinh-sach-bao-mat" className="text-green-600 hover:underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của chúng tôi.
                </p>
                <p>
                  Xem thêm{' '}
                  <Link href="/chinh-sach-van-chuyen" className="text-green-600 hover:underline">
                    Chính sách vận chuyển
                  </Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;