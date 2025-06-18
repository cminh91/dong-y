import Link from 'next/link';
import { Metadata } from 'next';
import PostCategoryActions from '@/components/admin/PostCategoryActions';

export const metadata: Metadata = {
  title: 'Quản lý danh mục tin tức - Admin',
  description: 'Quản lý danh mục bài viết tin tức',
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

// Fetch post categories from API
async function fetchPostCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/post-categories?limit=100`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post categories');
    }

    const data = await response.json();
    return data.success ? data.data.categories : [];
  } catch (error) {
    console.error('Error fetching post categories:', error);
    return [];
  }
}

export default async function PostCategoriesPage() {
  const categories: PostCategory[] = await fetchPostCategories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục tin tức</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh mục cho bài viết tin tức và blog
          </p>
        </div>
        <Link
          href="/admin/post-categories/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm danh mục mới
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thứ tự
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số bài viết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {category.sortOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={category.image}
                              alt={category.name}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.postsCount} bài viết
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <PostCategoryActions
                        categoryId={category.id}
                        categoryName={category.name}
                        postsCount={category.postsCount}
                      />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <i className="fas fa-folder-open text-6xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có danh mục tin tức nào
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Tạo danh mục đầu tiên để phân loại bài viết tin tức
                      </p>
                      <Link
                        href="/admin/post-categories/add"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Thêm danh mục đầu tiên
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-folder text-2xl text-blue-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng danh mục
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {categories.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-check-circle text-2xl text-green-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đang hoạt động
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {categories.filter(c => c.status === 'ACTIVE').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-newspaper text-2xl text-purple-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng bài viết
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {categories.reduce((sum, c) => sum + c.postsCount, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
