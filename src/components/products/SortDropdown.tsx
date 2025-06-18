"use client";

import { useRouter, useSearchParams } from 'next/navigation';

interface SortDropdownProps {
  sortBy: string;
  sortOrder: string;
}

export default function SortDropdown({ sortBy, sortOrder }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    
    // Update sort parameters
    params.set('sortBy', newSortBy);
    params.set('sortOrder', newSortOrder);
    
    // Reset to page 1 when sorting changes
    params.delete('page');
    
    // Navigate to new URL
    router.push(`/san-pham?${params.toString()}`);
  };

  return (
    <select 
      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
      value={`${sortBy}-${sortOrder}`}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="createdAt-desc">Mới nhất</option>
      <option value="price-asc">Giá thấp đến cao</option>
      <option value="price-desc">Giá cao đến thấp</option>
      <option value="name-asc">Tên A-Z</option>
      <option value="name-desc">Tên Z-A</option>
    </select>
  );
}
