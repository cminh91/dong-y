import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostCategoryForm from '@/components/admin/PostCategoryForm';

export const metadata: Metadata = {
  title: 'Chỉnh sửa danh mục tin tức - Admin',
  description: 'Chỉnh sửa thông tin danh mục tin tức',
};

interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
  sortOrder: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch post category by ID
async function fetchPostCategory(id: string): Promise<PostCategory | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/post-categories/${id}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 0 } // No cache for edit page
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching post category:', error);
    return null;
  }
}

interface EditPostCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostCategoryPage({ params }: EditPostCategoryPageProps) {
  const { id } = await params;
  const category = await fetchPostCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa danh mục tin tức</h1>
          <p className="text-gray-600 mt-1">
            Cập nhật thông tin danh mục: <strong>{category.name}</strong>
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Thông tin danh mục</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                <i className="fas fa-newspaper mr-1"></i>
                {category.postsCount} bài viết
              </span>
              <span>
                <i className="fas fa-calendar mr-1"></i>
                Tạo: {new Date(category.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <PostCategoryForm 
            initialData={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description || '',
              image: category.image || '',
              status: category.status,
              sortOrder: category.sortOrder
            }}
            isEdit={true}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Lưu ý khi chỉnh sửa danh mục
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Thay đổi slug sẽ ảnh hưởng đến URL của các bài viết trong danh mục này</li>
                <li>Đặt trạng thái "Không hoạt động" sẽ ẩn danh mục khỏi trang web</li>
                <li>Thứ tự hiển thị được sắp xếp từ nhỏ đến lớn (0, 1, 2, ...)</li>
                {category.postsCount > 0 && (
                  <li className="font-medium">
                    Danh mục này có {category.postsCount} bài viết đang sử dụng
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
