"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filtering
    params.delete('page');
    
    const queryString = params.toString();
    router.push(`/admin/products${queryString ? `?${queryString}` : ''}`);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    router.push('/admin/products');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên sản phẩm, SKU..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
          <select 
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="stock-asc">Tồn kho ít nhất</option>
            <option value="stock-desc">Tồn kho nhiều nhất</option>
          </select>
        </div>
        
        <div className="flex items-end space-x-2">
          <button 
            onClick={handleSearch}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
          >
            <i className="fas fa-search mr-2"></i>Tìm kiếm
          </button>
          <button 
            onClick={handleReset}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
            title="Reset bộ lọc"
          >
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
