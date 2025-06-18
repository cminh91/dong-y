'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { toast } from 'sonner';
import SafeImage from '@/components/common/SafeImage';

interface CartItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
}

const CartPage: FC = () => {
  const { state, updateQuantity, removeItem, syncWithDatabase, isLoading, hasPendingChanges } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Sync with database on page load
  useEffect(() => {
    syncWithDatabase();
  }, []);
  
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }
    updateQuantity(id, newQuantity);
  };
  
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };
  
  const applyCoupon = () => {
    // Mock coupon logic
    if (couponCode === 'DONGYPHARMACY10') {
      setDiscount(0.1); // 10% discount
      toast.success('Mã giảm giá đã được áp dụng!');
    } else if (couponCode === 'NEWCUSTOMER') {
      setDiscount(0.15); // 15% discount for new customers
      toast.success('Mã giảm giá đã được áp dụng!');
    } else {
      toast.error('Mã giảm giá không hợp lệ!');
    }
  };
  
  const subtotal = state.total;
  const discountAmount = subtotal * discount;
  const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping for orders over 500k
  const total = subtotal - discountAmount + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {state.itemCount} sản phẩm
            </div>
            {hasPendingChanges && (
              <div className="flex items-center space-x-1 text-blue-600 text-xs">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Sẽ đồng bộ khi thanh toán</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithDatabase}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {state.items.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button asChild>
              <Link href="/san-pham">
                Tiếp tục mua sắm
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm trong giỏ hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-20 h-20 relative overflow-hidden rounded bg-gray-100">
                        <Image
                          src={item.image && item.image !== '' ? item.image : '/images/placeholder.png'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.png';
                          }}
                          unoptimized={item.image?.startsWith('http')}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-green-600 font-bold">
                            {item.price.toLocaleString('vi-VN')}₫
                          </span>
                          {item.oldPrice && (
                            <span className="text-gray-500 line-through text-sm">
                              {item.oldPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 mt-2 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coupon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Mã giảm giá
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1"
                    />
                    <Button
                      onClick={applyCoupon}
                      variant="default"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      Đã áp dụng mã giảm giá: -{discountAmount.toLocaleString('vi-VN')}₫
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-3">
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{total.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/thanh-toan">
                    {hasPendingChanges ? 'Tiến hành thanh toán (sẽ đồng bộ)' : 'Tiến hành thanh toán'}
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/san-pham">
                    Tiếp tục mua sắm
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600">Đang đồng bộ giỏ hàng...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;