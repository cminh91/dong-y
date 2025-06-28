'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface PostDeleteActionProps {
  postId: string;
  postTitle: string;
}

export default function PostDeleteAction({ postId, postTitle }: PostDeleteActionProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${postTitle}" không?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Bài viết đã được xóa thành công!');
        router.refresh(); // Refresh the current page to show updated list
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa bài viết.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra khi xóa bài viết.');
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:text-red-900">
      <i className="fas fa-trash"></i>
    </button>
  );
}
