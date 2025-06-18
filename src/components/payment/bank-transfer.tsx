'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, Copy, QrCode, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
}

interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  transferContent: string;
  qrCode?: string;
}

interface BankTransferPaymentProps {
  orderId: string;
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  bankTransferInfo: BankTransferInfo;
  instructions: string[];
  message: string;
}

export function BankTransferPayment({
  orderId,
  amount,
  onSuccess,
  onError
}: BankTransferPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [supportedBanks, setSupportedBanks] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string>('');

  // Fetch supported banks on component mount
  useEffect(() => {
    fetchSupportedBanks();
  }, []);

  const fetchSupportedBanks = async () => {
    try {
      const response = await fetch('/api/payment/bank-transfer/create');
      const data = await response.json();
      
      if (data.success) {
        setSupportedBanks(data.banks);
        if (data.banks.length > 0) {
          setSelectedBank(data.banks[0].bankName);
        }
      }
    } catch (err) {
      console.error('Error fetching supported banks:', err);
    }
  };

  const createPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/bank-transfer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          bankName: selectedBank,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo thông tin chuyển khoản');
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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Đã sao chép ${field}`);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-8 w-8 p-0"
    >
      {copiedField === field ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span>Chuyển khoản ngân hàng</span>
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
            <span className="font-bold text-lg text-blue-600">
              {amount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>

        {!paymentData ? (
          <div className="space-y-4">
            {/* Bank Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn ngân hàng:</label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent>
                  {supportedBanks.map((bank) => (
                    <SelectItem key={bank.bankName} value={bank.bankName}>
                      {bank.bankName} - {bank.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={createPayment}
              disabled={loading || !selectedBank}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo thông tin chuyển khoản...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Tạo thông tin chuyển khoản
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-green-700">
                ✅ Thông tin chuyển khoản đã được tạo thành công!
              </AlertDescription>
            </Alert>

            {/* Bank Transfer Information */}
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Thông tin chuyển khoản</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ngân hàng:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{paymentData.bankTransferInfo.bankName}</span>
                    <CopyButton text={paymentData.bankTransferInfo.bankName} field="ngân hàng" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số tài khoản:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium">{paymentData.bankTransferInfo.accountNumber}</span>
                    <CopyButton text={paymentData.bankTransferInfo.accountNumber} field="số tài khoản" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tên tài khoản:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{paymentData.bankTransferInfo.accountHolder}</span>
                    <CopyButton text={paymentData.bankTransferInfo.accountHolder} field="tên tài khoản" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số tiền:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-blue-600">
                      {paymentData.bankTransferInfo.amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                    <CopyButton text={paymentData.bankTransferInfo.amount.toString()} field="số tiền" />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nội dung CK:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium bg-yellow-100 px-2 py-1 rounded">
                      {paymentData.bankTransferInfo.transferContent}
                    </span>
                    <CopyButton text={paymentData.bankTransferInfo.transferContent} field="nội dung chuyển khoản" />
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {paymentData.bankTransferInfo.qrCode && (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <QrCode className="h-4 w-4" />
                  <span>Quét mã QR để chuyển khoản nhanh</span>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border">
                    <Image
                      src={paymentData.bankTransferInfo.qrCode}
                      alt="Bank Transfer QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn chuyển khoản:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                {paymentData.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-yellow-900">Lưu ý quan trọng:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Vui lòng chuyển khoản đúng số tiền và nội dung để được xử lý tự động</li>
                <li>• Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được tiền</li>
                <li>• Thời gian xử lý: 1-24 giờ (trừ cuối tuần và ngày lễ)</li>
                <li>• Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}