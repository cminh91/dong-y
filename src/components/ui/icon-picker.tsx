'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const iconList = [
  { value: 'fa-leaf', label: 'Lá cây' },
  { value: 'fa-heartbeat', label: 'Nhịp tim' },
  { value: 'fa-pills', label: 'Viên thuốc' },
  { value: 'fa-mortar-pestle', label: 'Cối và chày' },
  { value: 'fa-seedling', label: 'Mầm cây' },
  { value: 'fa-spa', label: 'Spa' },
  { value: 'fa-stethoscope', label: 'Ống nghe' },
  { value: 'fa-first-aid', label: 'Sơ cứu' },
  { value: 'fa-book-medical', label: 'Sách y học' },
  { value: 'fa-capsules', label: 'Viên nang' },
  { value: 'fa-dna', label: 'DNA' },
  { value: 'fa-microscope', label: 'Kính hiển vi' },
  { value: 'fa-shield-alt', label: 'Khiên bảo vệ' },
  { value: 'fa-balance-scale', label: 'Cán cân' },
  { value: 'fa-hourglass-half', label: 'Đồng hồ cát' },
  { value: 'fa-star', label: 'Ngôi sao' },
  { value: 'fa-check-circle', label: 'Dấu tích' },
  { value: 'fa-info-circle', label: 'Thông tin' },
  { value: 'fa-thumbs-up', label: 'Thích' },
  { value: 'fa-users', label: 'Người dùng' },
  { value: 'fa-award', label: 'Giải thưởng' },
  { value: 'fa-certificate', label: 'Chứng nhận' },
  { value: 'fa-globe', label: 'Toàn cầu' },
  { value: 'fa-lightbulb', label: 'Bóng đèn' },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <div className="flex items-center gap-2">
          {value ? <i className={`fas ${value} w-4`}></i> : null}
          <SelectValue placeholder="Chọn một biểu tượng" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {iconList.map((icon) => (
          <SelectItem key={icon.value} value={icon.value}>
            <div className="flex items-center gap-2">
              <i className={`fas ${icon.value} w-4`}></i>
              <span>{icon.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};