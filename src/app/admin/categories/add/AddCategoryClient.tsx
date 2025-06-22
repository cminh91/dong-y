"use client";

import CategoryForm from '@/components/admin/CategoryForm';

export default function AddCategoryClient() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Thông tin danh mục</h2>
      </div>
      <div className="p-6">
        <CategoryForm />
      </div>
    </div>
  );
}