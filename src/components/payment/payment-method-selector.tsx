'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Truck, 
  QrCode,
  Building,
  User,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import Image from 'next/image';

interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  notes?: string;
  qrImage?: string[];
  momoEnabled: boolean;
  momoPhoneNumber?: string;
  momoAccountName?: string;
  momoQrImage?: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: string) => void;
  selectedMethod?: string;
  disabled?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    description: 'Thanh toán nhanh chóng qua ví điện tử MoMo',
    icon: <Smartphone className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua Internet Banking hoặc ATM',
    icon: <Building2 className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: <Truck className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng/Ghi nợ',
    description: 'Thanh toán bằng thẻ Visa, Mastercard',
    icon: <CreditCard className="h-6 w-6" />,
    available: false, // Tạm thời chưa hỗ trợ
  },
];


export function PaymentMethodSelector({
  onMethodSelect,
  selectedMethod,
  disabled = false
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState(selectedMethod || '');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/payment');
        const data = await response.json();
        if (data.success && data.data) {
          setPaymentSettings(data.data);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  // Update available methods based on settings
  const availableMethods = paymentMethods.map(method => ({
    ...method,
    available: method.id === 'momo' ? (paymentSettings?.momoEnabled ?? false) : method.available
  }));

  const handleMethodChange = (value: string) => {
    setSelected(value);
    onMethodSelect(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Chọn phương thức thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Đang tải phương thức thanh toán...
          </div>
        ) : (
          <>
            <RadioGroup
              value={selected}
              onValueChange={handleMethodChange}
              className="space-y-4"
            >
              {availableMethods.map((method) => (
                <Label
                  key={method.id}
                  htmlFor={method.id}
                  className={`
                    flex items-center space-x-3 rounded-lg border p-4 transition-colors
                    ${
                      method.available
                        ? 'cursor-pointer hover:bg-gray-50'
                        : 'cursor-not-allowed opacity-50'
                    }
                    ${
                      selected === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }
                  `}
                >
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={!method.available || disabled}
                    className="mt-0.5"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`
                      p-2 rounded-lg
                      ${
                        selected === method.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`
                        text-sm font-medium
                        ${!method.available ? 'cursor-not-allowed' : ''}
                      `}>
                        {method.name}
                        {!method.available && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Sắp ra mắt)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            {selected && (
              <div className="mt-6">
                {selected === 'momo' && paymentSettings?.momoEnabled && (
                  <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border">
                    <div className="flex items-center space-x-2 text-primary">
                      <Smartphone className="h-5 w-5" />
                      <p className="font-medium">Thanh toán qua MoMo</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 rounded-lg border bg-white p-3">
                        {paymentSettings.momoPhoneNumber && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Số điện thoại</p>
                              <p className="font-medium">{paymentSettings.momoPhoneNumber}</p>
                            </div>
                          </div>
                        )}
                        {paymentSettings.momoAccountName && (
                          <div className="flex items-center space-x-3 pt-2">
                            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Tên tài khoản</p>
                              <p className="font-medium">{paymentSettings.momoAccountName}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {paymentSettings.momoQrImage?.[0] && (
                        <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-white">
                          <QrCode className="h-5 w-5 text-primary mb-1" />
                          <div className="relative w-full aspect-square max-w-[200px]">
                            <Image
                              src={paymentSettings.momoQrImage[0]}
                              alt="Mã QR MoMo"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-500">Quét mã để thanh toán</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selected === 'bank_transfer' && (
                  <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border">
                    <div className="flex items-center space-x-2 text-primary">
                      <Building2 className="h-5 w-5" />
                      <p className="font-medium">Thông tin chuyển khoản</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 rounded-lg border bg-white p-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {paymentSettings?.bankName && (
                            <div className="flex items-start space-x-2">
                              <Building className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Ngân hàng</p>
                                <p className="text-sm font-medium">{paymentSettings.bankName}</p>
                              </div>
                            </div>
                          )}
                          {paymentSettings?.accountHolder && (
                            <div className="flex items-start space-x-2">
                              <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Chủ tài khoản</p>
                                <p className="text-sm font-medium">{paymentSettings.accountHolder}</p>
                              </div>
                            </div>
                          )}
                          {paymentSettings?.accountNumber && (
                            <div className="flex items-start space-x-2 col-span-2">
                              <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Số tài khoản</p>
                                <p className="text-sm font-medium">{paymentSettings.accountNumber}</p>
                              </div>
                            </div>
                          )}
                          {paymentSettings?.branch && (
                            <div className="flex items-start space-x-2 col-span-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Chi nhánh</p>
                                <p className="text-sm font-medium">{paymentSettings.branch}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {paymentSettings?.notes && (
                          <div className="flex items-start space-x-2 border-t pt-3 mt-3">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">Nội dung chuyển khoản</p>
                              <p className="text-sm font-medium mt-1">{paymentSettings.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {paymentSettings?.qrImage?.[0] && (
                        <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-white">
                          <QrCode className="h-5 w-5 text-primary mb-1" />
                          <div className="relative w-full aspect-square max-w-[200px]">
                            <Image
                              src={paymentSettings.qrImage[0]}
                              alt="Mã QR chuyển khoản"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-500">Quét mã để chuyển khoản</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selected === 'cod' && (
                  <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg border">
                    <div className="flex items-center space-x-2 text-primary">
                      <Truck className="h-5 w-5" />
                      <p className="font-medium">Thanh toán khi nhận hàng</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-3 rounded-lg border p-3 bg-white">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Lưu ý:</p>
                          <ul className="space-y-1 mt-1 list-disc pl-4 text-gray-600">
                            <li>Thanh toán bằng tiền mặt khi nhận hàng</li>
                            <li>Kiểm tra hàng trước khi thanh toán</li>
                            <li>Phí ship có thể cao hơn các phương thức khác</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}