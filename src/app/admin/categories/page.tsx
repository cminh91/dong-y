"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function CategoriesPage() {
  // Dữ liệu mẫu cho danh mục
  const [categories] = useState([
    {
      id: 1,
      name: 'Đông Y',
      description: 'Các sản phẩm thuốc đông y',
      slug: 'dong-y',
      type: 'Sản phẩm',
      status: 'Hiển thị',
      level: 1,
      parent: 'Không có'
    },
    {
      id: 2,
      name: 'Thảo dược',
      description: 'Các sản phẩm thảo dược tự nhiên',
      slug: 'thao-duoc',
      type: 'Sản phẩm',
      status: 'Hiển thị',
      level: 1,
      parent: 'Không có'
    },
    {
      id: 3,
      name: 'Thuốc bổ gan',
      description: 'Các sản phẩm thuốc bổ gan',
      slug: 'thuoc-bo-gan',
      type: 'Sản phẩm',
      status: 'Hiển thị',
      level: 2,
      parent: 'Đông Y'
    },
    {
      id: 4,
      name: 'Tin tức sức khỏe',
      description: 'Bài viết về sức khỏe',
      slug: 'tin-tuc-suc-khoe',
      type: 'Tin tức',
      status: 'Hiển thị',
      level: 1,
      parent: 'Không có'
    },
    {
      id: 5,
      name: 'Giới thiệu',
      description: 'Thông tin giới thiệu về công ty',
      slug: 'gioi-thieu',
      type: 'Giới thiệu',
      status: 'Hiển thị',
      level: 1,
      parent: 'Không có'
    }
  ]);


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
            {categories.map((category, index) => (
              <tr key={category.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 whitespace-nowrap">{index + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{category.name}</td>
                <td className="px-3 py-2 hidden md:table-cell">{category.description}</td>
                <td className="px-3 py-2 hidden md:table-cell">{category.slug}</td>
                <td className="px-3 py-2">{category.type}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.status === 'Hiển thị'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.status}
                  </span>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">{category.level}</td>
                <td className="px-3 py-2 hidden sm:table-cell">{category.parent}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <Link href={`/admin/categories/edit/${category.id}`} className="text-blue-600 hover:text-blue-900">
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
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
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{categories.length}</span> của <span className="font-medium">{categories.length}</span> danh mục
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