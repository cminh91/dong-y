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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (postsCount > 0) {
      alert(`Không thể xóa danh mục "${categoryName}" vì có ${postsCount} bài viết đang sử dụng.`);
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
      setShowDeleteConfirm(false);
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
        onClick={() => setShowDeleteConfirm(true)}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
        disabled={isDeleting}
        title="Xóa danh mục"
      >
        <i className="fas fa-trash mr-1"></i>
        {isDeleting ? 'Đang xóa...' : 'Xóa'}
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Xác nhận xóa danh mục
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryName}"</strong>?
                </p>
                {postsCount > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Danh mục này có <strong>{postsCount} bài viết</strong>. 
                      Không thể xóa danh mục đang được sử dụng.
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || postsCount > 0}
                    className={`px-4 py-2 text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 ${
                      postsCount > 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash mr-2"></i>
                        Xóa danh mục
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
