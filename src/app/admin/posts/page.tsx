import Link from 'next/link';
import Image from 'next/image';
import PostFilters from '@/components/admin/PostFilters';
import PostDeleteAction from '@/components/admin/PostDeleteAction';
import AdminPagination from '@/components/admin/AdminPagination';


interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  status: string;
  authorName: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    authorId?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

// Fetch posts from API
async function fetchPosts(searchParams: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  // Ensure baseUrl has protocol
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = new URL('/api/posts', fullBaseUrl);

  // Add search params to URL
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key]) {
      url.searchParams.set(key, searchParams[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    return data.success ? data.data : { posts: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pagination: {} };
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search;
  const status = params.status;
  const authorId = params.authorId;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';

  // Fetch posts
  const { posts, pagination } = await fetchPosts({
    page: page.toString(),
    search,
    status,
    authorId,
    sortBy,
    sortOrder,
    limit: '20'
  });

  // Mock authors for filter - later can be fetched from API
  const authors = [
    { id: '1', name: 'Nguyễn Văn A' },
    { id: '2', name: 'Trần Thị B' },
    { id: '3', name: 'Lê Văn C' },
    { id: '4', name: 'Phạm Thị D' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-1">
            Tìm thấy {pagination.totalCount || 0} bài viết
          </p>
        </div>
        <Link
          href="/admin/posts/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm bài viết
        </Link>
      </div>

      {/* Filter and Search */}
      <PostFilters authors={authors} />

      {/* Post List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {posts && posts.length > 0 ? (
          <>
        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài viết</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post: Post) => (
                <tr key={post.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={post.image || '/images/placeholder.png'}
                          alt={post.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</div>
                        <div className="text-sm text-gray-500">Slug: {post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {post.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa phân loại</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.authorName}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status === 'PUBLISHED' ? 'Đã đăng' :
                       post.status === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/posts/edit/${post.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <PostDeleteAction postId={post.id} postTitle={post.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for smaller screens */}
        <div className="md:hidden divide-y divide-gray-200">
          {posts.map((post: Post) => (
            <div key={post.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <Image
                    src={post.image || '/images/placeholder.png'}
                    alt={post.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-500">Slug: {post.slug}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Tác giả:</span> {post.authorName}
                </div>
                <div>
                  <span className="text-gray-500">Ngày tạo:</span> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div>
                  <span className="text-gray-500">Ngày đăng:</span> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa đăng'}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span
                    className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.status === 'PUBLISHED' ? 'Đã đăng' :
                     post.status === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <Link href={`/admin/posts/edit/${post.id}`} className="text-blue-600 hover:text-blue-900">
                  <i className="fas fa-edit"></i>
                </Link>
                <button className="text-red-600 hover:text-red-900">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <AdminPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-newspaper text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-600 mb-6">
              {search || status || authorId
                ? 'Không có bài viết nào phù hợp với bộ lọc hiện tại'
                : 'Chưa có bài viết nào trong hệ thống'
              }
            </p>
            <Link
              href="/admin/posts/add"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Thêm bài viết đầu tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}