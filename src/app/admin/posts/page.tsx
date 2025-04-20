'use client';
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PostsPage: FC = () => {
  // Mock data for posts list
  const posts = [
    {
      id: '1',
      title: 'Lợi ích của đông y trong điều trị bệnh mãn tính',
      image: '/images/hepasaky.png',
      category: 'Sức khỏe',
      author: 'Nguyễn Văn A',
      date: '15/05/2024',
      status: 'Đã đăng',
      views: 1250,
    },
    {
      id: '2',
      title: 'Các bài thuốc đông y giúp tăng cường hệ miễn dịch',
      image: '/images/lypasaky.png',
      category: 'Đông y',
      author: 'Trần Thị B',
      date: '10/05/2024',
      status: 'Đã đăng',
      views: 980,
    },
    {
      id: '3',
      title: 'Phương pháp chữa bệnh từ các vị thuốc tự nhiên',
      image: '/images/trongdong.png',
      category: 'Đông y',
      author: 'Lê Văn C',
      date: '05/05/2024',
      status: 'Nháp',
      views: 0,
    },
    {
      id: '4',
      title: 'Bí quyết sống khỏe từ y học cổ truyền',
      image: '/images/hepasaky.png',
      category: 'Sức khỏe',
      author: 'Phạm Thị D',
      date: '01/05/2024',
      status: 'Đã đăng',
      views: 750,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <Link
          href="/admin/posts/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Thêm bài viết
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tiêu đề bài viết..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả danh mục</option>
              <option value="suc-khoe">Sức khỏe</option>
              <option value="dong-y">Đông y</option>
              <option value="tin-tuc">Tin tức</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="da-dang">Đã đăng</option>
              <option value="nhap">Nháp</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
              <i className="fas fa-search mr-2"></i>Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bài viết</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt xem</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">ID: {post.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.category}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.date}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.views.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'Đã đăng' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/posts/edit/${post.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for smaller screens */}
        <div className="md:hidden divide-y divide-gray-200">
          {posts.map((post) => (
            <div key={post.id} className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-500">ID: {post.id}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Danh mục:</span> {post.category}
                </div>
                <div>
                  <span className="text-gray-500">Tác giả:</span> {post.author}
                </div>
                <div>
                  <span className="text-gray-500">Ngày đăng:</span> {post.date}
                </div>
                <div>
                  <span className="text-gray-500">Lượt xem:</span> {post.views.toLocaleString()}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span
                    className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'Đã đăng' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.status}
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
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> của{' '}
              <span className="font-medium">4</span> bài viết
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <i className="fas fa-chevron-left"></i>
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <i className="fas fa-chevron-right"></i>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;