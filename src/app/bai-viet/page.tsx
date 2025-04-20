import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toSlug } from '@/utils/stringUtils';

interface BlogPostProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
}

const BlogPage: FC = () => {
  // Trong thực tế, dữ liệu này sẽ được lấy từ API
  const posts: BlogPostProps[] = [
    {
      id: '1',
      title: 'Các bài thuốc Đông y chữa bệnh gan hiệu quả',
      excerpt: 'Khám phá các bài thuốc Đông y truyền thống giúp điều trị và phòng ngừa các bệnh về gan một cách hiệu quả và an toàn.',
      image: 'https://images.unsplash.com/photo-1512675828443-4f454c42253a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      author: 'Ths.Bs Nguyễn Văn A',
      date: '2024-01-15',
      category: 'Sức khỏe',
      readTime: 5
    },
    {
      id: '2',
      title: 'Cách chăm sóc sức khỏe trong mùa đông',
      excerpt: 'Những lời khuyên và phương pháp từ Đông y giúp bạn và gia đình khỏe mạnh trong những ngày giá lạnh.',
      image: 'https://images.unsplash.com/photo-1577315734214-4b3dec92d9ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      author: 'Ths.Bs Trần Thị B',
      date: '2024-01-10',
      category: 'Mùa đông',
      readTime: 4
    },
    {
      id: '3',
      title: 'Top 10 thảo dược tăng cường hệ miễn dịch',
      excerpt: 'Danh sách các loại thảo dược quý giúp nâng cao sức đề kháng và bảo vệ cơ thể khỏi bệnh tật.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1184&q=80',
      author: 'Ths.Bs Lê Văn C',
      date: '2024-01-05',
      category: 'Thảo dược',
      readTime: 6
    },
    {
      id: '4',
      title: 'Phương pháp điều trị mất ngủ bằng Đông y',
      excerpt: 'Giải pháp an toàn và hiệu quả từ Đông y giúp cải thiện chất lượng giấc ngủ một cách tự nhiên.',
      image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      author: 'Ths.Bs Phạm Thị D',
      date: '2024-01-01',
      category: 'Giấc ngủ',
      readTime: 5
    }
  ];

  const categories = [
    'Tất cả',
    'Sức khỏe',
    'Thảo dược',
    'Đông y',
    'Dinh dưỡng',
    'Làm đẹp',
    'Mùa đông',
    'Giấc ngủ'
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
                  href={`/bai-viet/category/${toSlug(category)}`}
                  className={`block py-2 px-4 rounded-lg hover:bg-green-50 ${index === 0 ? 'bg-green-50 text-green-700' : ''}`}
                >
                  {category}
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Đăng ký nhận tin</h2>
              <p className="text-gray-600 mb-4">Nhận thông tin mới nhất về sức khỏe và đông y</p>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="btn-primary w-full py-2">
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Bài viết</h1>
            <select className="form-select border rounded-lg px-4 py-2">
              <option>Mới nhất</option>
              <option>Phổ biến nhất</option>
              <option>Xem nhiều nhất</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <Link
                    href={`/bai-viet/category/${toSlug(post.category)}`}
                    className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {post.category}
                  </Link>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">
                    <Link href={`/bai-viet/${toSlug(post.title)}-${post.id}`} className="hover:text-green-600">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <i className="fas fa-user-md mr-2"></i>
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span><i className="far fa-calendar mr-2"></i>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                      <span><i className="far fa-clock mr-2"></i>{post.readTime} phút đọc</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Phân trang */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-lg border hover:bg-green-50" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white">1</button>
              <button className="px-4 py-2 rounded-lg border hover:bg-green-50">2</button>
              <button className="px-4 py-2 rounded-lg border hover:bg-green-50">3</button>
              <button className="px-3 py-2 rounded-lg border hover:bg-green-50">
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;