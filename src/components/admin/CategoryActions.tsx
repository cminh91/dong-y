"use client";

import { useRouter } from 'next/navigation';

interface CategoryActionsProps {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export default function CategoryActions({ categoryId, categoryName, productCount }: CategoryActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (productCount > 0) {
      alert('Không thể xóa danh mục có sản phẩm!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Đã xóa danh mục thành công!');
        router.refresh(); // Refresh the page to update the list
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục');
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => router.push(`/admin/categories/edit/${categoryId}`)}
        className="text-indigo-600 hover:text-indigo-900"
        title="Chỉnh sửa"
      >
        <i className="fas fa-edit"></i>
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-900"
        title="Xóa"
        disabled={productCount > 0}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}
