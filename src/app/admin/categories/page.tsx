"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string; // Loại danh mục: Sản phẩm, Tin tức, Giới thiệu, ...
  status: 'ACTIVE' | 'INACTIVE';
  parentId?: string | null;
  level: 1 | 2 | 3;
  parentName?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/categories');
        if (!res.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách danh mục');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`/api/admin/categories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi xóa danh mục');
      }

      setCategories(categories.filter(c => c.id !== id));
      toast.success('Xóa danh mục thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa danh mục');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-5 md:px-6 md:py-6">
      {/* Tiêu đề và nút thêm */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý danh mục</h1>
        <Link 
          href="/admin/categories/add" 
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
        >
          <i className="fas fa-plus"></i>
          <span>Thêm danh mục</span>
        </Link>
      </div>
  
      {/* Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input 
              type="text" 
              placeholder="Tên danh mục..." 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="hien-thi">Hiển thị</option>
              <option value="an">Ẩn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại danh mục</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">Loại danh mục</option>
              <option value="tin-tuc">Tin tức</option>
              <option value="san-pham">Sản phẩm</option>
              <option value="khac">Giới thiệu</option>
            </select>
          </div>
        </div>
      </div>
  
      {/* Bảng danh mục */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap">STT</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Tên</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">Mô tả</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">Slug</th>
              <th className="px-3 py-2 text-left">Loại</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left hidden sm:table-cell">Cấp</th>
              <th className="px-3 py-2 text-left hidden sm:table-cell">Danh mục cha</th>
              <th className="px-3 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category, idx) => (
              <tr key={category.id}>
                <td className="px-3 py-3">{idx + 1}</td>
                <td className="px-3 py-3">{category.name}</td>
                <td className="px-3 py-3 hidden md:table-cell">{category.description}</td>
                <td className="px-3 py-3 hidden md:table-cell">{category.slug}</td>
                <td className="px-3 py-3">{category.type}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${category.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.status}
                  </span>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell">{category.level}</td>
                <td className="px-3 py-3 hidden sm:table-cell">{category.parentName || '-'}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/categories/${category.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Phân trang */}
      <div className="bg-white px-3 py-3 mt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">5</span> của <span className="font-medium">5</span> danh mục
          </div>
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <a href="#" className="px-2 py-2 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-l-md">
              <i className="fas fa-chevron-left"></i>
            </a>
            <a href="#" className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
              1
            </a>
            <a href="#" className="px-2 py-2 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-r-md">
              <i className="fas fa-chevron-right"></i>
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
  
}