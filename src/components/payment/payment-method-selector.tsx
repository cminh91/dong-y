'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Building2, Truck } from 'lucide-react';

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
        <RadioGroup
          value={selected}
          onValueChange={handleMethodChange}
          disabled={disabled}
          className="space-y-4"
        >
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative">
              <div
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
                    <Label
                      htmlFor={method.id}
                      className={`
                        text-sm font-medium cursor-pointer
                        ${!method.available ? 'cursor-not-allowed' : ''}
                      `}
                    >
                      {method.name}
                      {!method.available && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Sắp ra mắt)
                        </span>
                      )}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        {selected && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                {selected === 'momo' && (
                  <div>
                    <p className="font-medium mb-1">Thanh toán qua MoMo:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Thanh toán an toàn, bảo mật cao</li>
                      <li>• Xử lý giao dịch tức thì</li>
                      <li>• Hỗ trợ quét mã QR hoặc chuyển tiếp đến app MoMo</li>
                    </ul>
                  </div>
                )}
                {selected === 'bank_transfer' && (
                  <div>
                    <p className="font-medium mb-1">Chuyển khoản ngân hàng:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Chuyển khoản qua Internet Banking hoặc ATM</li>
                      <li>• Quét mã QR để chuyển khoản nhanh chóng</li>
                      <li>• Xác nhận thanh toán trong vòng 24h</li>
                    </ul>
                  </div>
                )}
                {selected === 'cod' && (
                  <div>
                    <p className="font-medium mb-1">Thanh toán khi nhận hàng:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Thanh toán bằng tiền mặt khi nhận hàng</li>
                      <li>• Kiểm tra hàng trước khi thanh toán</li>
                      <li>• Phí ship có thể cao hơn các phương thức khác</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}