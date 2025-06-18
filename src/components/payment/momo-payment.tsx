'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, QrCode, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface MoMoPaymentProps {
  orderId: string;
  amount: number;
  orderInfo?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  payUrl: string;
  deeplink?: string;
  qrCodeUrl?: string;
  message: string;
}

export function MoMoPayment({
  orderId,
  amount,
  orderInfo,
  onSuccess,
  onError
}: MoMoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string>('');

  const createPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo link thanh toán');
      }

      setPaymentData(data);
      onSuccess?.(data.paymentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openMoMoApp = () => {
    if (paymentData?.deeplink) {
      window.open(paymentData.deeplink, '_blank');
    } else if (paymentData?.payUrl) {
      window.open(paymentData.payUrl, '_blank');
    }
  };

  const openPaymentPage = () => {
    if (paymentData?.payUrl) {
      window.open(paymentData.payUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-pink-600" />
          <span>Thanh toán MoMo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Đơn hàng:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Số tiền:</span>
            <span className="font-bold text-lg text-pink-600">
              {amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        {!paymentData ? (
          <Button
            onClick={createPayment}
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo link thanh toán...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Thanh toán với MoMo
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-green-700">
                ✅ Link thanh toán đã được tạo thành công!
              </AlertDescription>
            </Alert>

            {/* QR Code */}
            {paymentData.qrCodeUrl && (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <QrCode className="h-4 w-4" />
                  <span>Quét mã QR để thanh toán</span>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border">
                    <Image
                      src={paymentData.qrCodeUrl}
                      alt="MoMo QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Mở app MoMo và quét mã QR để thanh toán
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentData.deeplink && (
                <Button
                  onClick={openMoMoApp}
                  className="bg-pink-600 hover:bg-pink-700"
                  size="lg"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mở app MoMo
                </Button>
              )}
              
              <Button
                onClick={openPaymentPage}
                variant="outline"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Thanh toán trên web
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn thanh toán:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Quét mã QR bằng app MoMo hoặc nhấn "Mở app MoMo"</li>
                <li>2. Kiểm tra thông tin đơn hàng và số tiền</li>
                <li>3. Nhập mã PIN hoặc xác thực sinh trắc học</li>
                <li>4. Hoàn tất thanh toán</li>
                <li>5. Bạn sẽ được chuyển về trang xác nhận</li>
              </ol>
            </div>

            {/* Timeout Warning */}
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⏰ Link thanh toán có hiệu lực trong 15 phút. 
                Vui lòng hoàn tất thanh toán trước khi hết hạn.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}