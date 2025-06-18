"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PostFiltersProps {
  authors?: Array<{
    id: string;
    name: string;
  }>;
}

export default function PostFilters({ authors = [] }: PostFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    authorId: searchParams.get('authorId') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    // Reset to page 1 when searching
    params.set('page', '1');
    
    router.push(`/admin/posts?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      authorId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    router.push('/admin/posts');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tiêu đề bài viết..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
          <select 
            value={filters.authorId}
            onChange={(e) => handleFilterChange('authorId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tất cả tác giả</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
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
            <option value="title-asc">Tiêu đề A-Z</option>
            <option value="title-desc">Tiêu đề Z-A</option>
            <option value="publishedAt-desc">Ngày đăng mới nhất</option>
            <option value="publishedAt-asc">Ngày đăng cũ nhất</option>
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
