"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductActionsProps {
  productId: string;
  productName: string;
  productStock: number;
}

export default function ProductActions({ productId, productName, productStock }: ProductActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Đã xóa sản phẩm thành công!');
        router.refresh(); // Refresh the page to update the list
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/admin/products/${productId}`}
        className="text-blue-600 hover:text-blue-900"
        title="Xem chi tiết"
      >
        <i className="fas fa-eye"></i>
      </Link>
      <Link
        href={`/admin/products/edit/${productId}`}
        className="text-indigo-600 hover:text-indigo-900"
        title="Chỉnh sửa"
      >
        <i className="fas fa-edit"></i>
      </Link>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-900"
        title="Xóa"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}
