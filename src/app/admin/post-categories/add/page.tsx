import { Metadata } from 'next';
import PostCategoryForm from '@/components/admin/PostCategoryForm';

export const metadata: Metadata = {
  title: 'Thêm danh mục tin tức - Admin',
  description: 'Thêm danh mục mới cho bài viết tin tức',
};

export default function AddPostCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm danh mục tin tức</h1>
          <p className="text-gray-600 mt-1">
            Tạo danh mục mới để phân loại bài viết tin tức
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin danh mục</h2>
        </div>
        <div className="p-6">
          <PostCategoryForm />
        </div>
      </div>
    </div>
  );
}
