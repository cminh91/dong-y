'use client';

import AddCategoryClient from './AddCategoryClient';

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm danh mục sản phẩm</h1>
        <p className="text-gray-600 mt-1">
          Tạo danh mục mới để phân loại sản phẩm của bạn.
        </p>
      </div>
      <AddCategoryClient />
    </div>
  );
}
