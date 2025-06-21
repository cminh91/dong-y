import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bài viết - Đông Y Pharmacy',
  description: 'Khám phá những bài viết hữu ích về y học cổ truyền, dược liệu và sức khỏe',
};

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  authorName: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt: string | null;
  createdAt: string;
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

// Fetch posts from API
async function fetchPosts(searchParams: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = new URL('/api/posts', fullBaseUrl);

  // Add search params to URL
  url.searchParams.set('status', 'PUBLISHED'); // Only published posts for public
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key]) {
      url.searchParams.set(key, searchParams[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store' // Always fetch fresh data for SSR
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

  // Fetch posts
  const { posts, pagination } = await fetchPosts({
    page: page.toString(),
    search,
    limit: '4'
  });

  // Mock categories for now - later can be fetched from API
  const categories = [
    'Tất cả',
    'Sức khỏe',
    'Thảo dược',
    'Đông y',
    'Dinh dưỡng',
    'Làm đẹp'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Danh mục</h2>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={`/bai-viet?category=${encodeURIComponent(category)}`}
                  className={`block py-2 px-4 rounded-lg hover:bg-green-50 ${index === 0 ? 'bg-green-50 text-green-700' : ''}`}
                >
                  {category}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Tìm kiếm</h2>
              <form method="GET" className="space-y-4">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="btn-primary w-full py-2">
                  Tìm kiếm
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div className="md:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-2 sm:space-y-0">
            <h1 className="text-3xl font-bold">Bài viết</h1>
            <div className="text-sm text-gray-600">
              {pagination.totalCount > 0 && (
                <>
                  Hiển thị {((pagination.currentPage - 1) * 4) + 1} - {Math.min(pagination.currentPage * 4, pagination.totalCount)}
                  {' '}trong tổng số {pagination.totalCount} bài viết
                  {pagination.totalPages > 1 && (
                    <span className="ml-2">
                      (Trang {pagination.currentPage}/{pagination.totalPages})
                    </span>
                  )}
                </>
              )}
              {pagination.totalCount === 0 && (
                <span>Không có bài viết nào</span>
              )}
            </div>
          </div>

          {posts && posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((post: Post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={post.image || '/images/placeholder.png'}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      {post.category && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {post.category.name}
                          </span>
                        </div>
                      )}

                      <h2 className="text-xl font-bold mb-2">
                        <Link href={`/bai-viet/${post.slug}`} className="hover:text-green-600">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <i className="fas fa-user-md mr-2"></i>
                          <span>{post.authorName}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>
                            <i className="far fa-calendar mr-2"></i>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Phân trang */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-1">
                    {/* Previous button */}
                    {pagination.hasPrevPage ? (
                      <Link
                        href={`/bai-viet?page=${pagination.currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </Link>
                    ) : (
                      <span className="px-3 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                        <i className="fas fa-chevron-left"></i>
                      </span>
                    )}

                    {/* Page numbers */}
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const currentPage = pagination.currentPage;
                      const pages = [];

                      // Always show first page
                      if (currentPage > 3) {
                        pages.push(1);
                        if (currentPage > 4) {
                          pages.push('...');
                        }
                      }

                      // Show pages around current page
                      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                        pages.push(i);
                      }

                      // Always show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push('...');
                        }
                        pages.push(totalPages);
                      }

                      return pages.map((pageNum, index) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        return (
                          <Link
                            key={pageNum}
                            href={`/bai-viet?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                              pageNum === currentPage
                                ? 'bg-green-600 text-white shadow-md transform scale-105'
                                : 'border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-600 hover:shadow-sm'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      });
                    })()}

                    {/* Next button */}
                    {pagination.hasNextPage ? (
                      <Link
                        href={`/bai-viet?page=${pagination.currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </Link>
                    ) : (
                      <span className="px-3 py-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                        <i className="fas fa-chevron-right"></i>
                      </span>
                    )}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-newspaper text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-600">
                {search ? 'Không có bài viết nào phù hợp với từ khóa tìm kiếm' : 'Chưa có bài viết nào được đăng'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
