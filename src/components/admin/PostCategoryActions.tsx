'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostCategoryActionsProps {
  categoryId: string;
  categoryName: string;
  postsCount: number;
}

export default function PostCategoryActions({ 
  categoryId, 
  categoryName, 
  postsCount 
}: PostCategoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (postsCount > 0) {
      alert(`Không thể xóa danh mục "${categoryName}" vì có ${postsCount} bài viết đang sử dụng.`);
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/post-categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Xóa danh mục thành công!');
        router.refresh();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa danh mục');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* View/Edit Button */}
      <Link
        href={`/admin/post-categories/edit/${categoryId}`}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        title="Chỉnh sửa danh mục"
      >
        <i className="fas fa-edit mr-1"></i>
        Sửa
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
        disabled={isDeleting}
        title="Xóa danh mục"
      >
        <i className="fas fa-trash mr-1"></i>
        {isDeleting ? 'Đang xóa...' : 'Xóa'}
      </button>
    </div>
  );
}
