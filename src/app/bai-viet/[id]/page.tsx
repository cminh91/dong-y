import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { extractIdFromSlug, toSlug } from '@/utils/stringUtils';

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

const BlogPostPage: FC<BlogPostPageProps> = ({ params }) => {
  // Next.js 15+ dynamic API: unwrap params bằng React.use()
  const { id } = React.use(params);
  // Trích xuất ID từ slug tiếng Việt
  const postId = extractIdFromSlug(id);
  
  // Trong thực tế, dữ liệu này sẽ được lấy từ API dựa trên postId
  const post = {
    id: postId,
    title: 'Các bài thuốc Đông y chữa bệnh gan hiệu quả',
    content: `
      <p>Gan là một trong những cơ quan quan trọng nhất của cơ thể, đóng vai trò thiết yếu trong việc lọc máu, sản xuất mật và thực hiện hơn 500 chức năng sinh hóa khác nhau. Khi gan gặp vấn đề, toàn bộ cơ thể sẽ bị ảnh hưởng.</p>
      
      <h2>1. Hoàng Liên Giải Độc Hoàn</h2>
      <p>Bài thuốc cổ phương này có tác dụng thanh nhiệt, giải độc, đặc biệt hiệu quả với các bệnh về gan do nhiệt độc gây ra như viêm gan virus, vàng da, gan nhiễm mỡ.</p>
      <p><strong>Thành phần:</strong> Hoàng liên, Hoàng cầm, Hoàng bá, Đan sâm, Nhân trần, Kê huyết đằng.</p>
      <p><strong>Cách dùng:</strong> Ngày uống 2 lần, mỗi lần 2-3 viên sau bữa ăn.</p>
      
      <h2>2. Trà Nhân Trần</h2>
      <p>Nhân trần là vị thuốc quý trong Đông y, có tác dụng thanh nhiệt, lợi thấp, giải độc gan, hỗ trợ điều trị viêm gan và vàng da hiệu quả.</p>
      <p><strong>Cách dùng:</strong> Dùng 10-15g nhân trần khô hãm với nước sôi, uống thay trà hàng ngày.</p>
      
      <h2>3. Bài thuốc Dưỡng Can Thảo</h2>
      <p>Đây là bài thuốc kết hợp nhiều vị thảo dược có tác dụng bổ gan, tăng cường chức năng gan, phù hợp với người bị suy giảm chức năng gan, mệt mỏi, chán ăn.</p>
      <p><strong>Thành phần:</strong> Đương quy, Bạch thược, Sinh địa, Câu đằng, Bạch truật, Phục linh, Trần bì.</p>
      <p><strong>Cách dùng:</strong> Sắc uống ngày 1 thang, chia 2 lần.</p>
    `,
    image: 'https://images.unsplash.com/photo-1512675828443-4f454c42253a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    author: 'Ths.Bs Nguyễn Văn A',
    date: '2024-01-15',
    category: 'Sức khỏe',
    readTime: 5,
    relatedPosts: [
      {
        id: '2',
        title: 'Cách chăm sóc sức khỏe trong mùa đông',
        image: 'https://images.unsplash.com/photo-1577315734214-4b3dec92d9ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      },
      {
        id: '3',
        title: 'Top 10 thảo dược tăng cường hệ miễn dịch',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1184&q=80',
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link href="/" className="text-gray-600 hover:text-green-600">Trang chủ</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link href="/bai-viet" className="text-gray-600 hover:text-green-600">Bài viết</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-green-600">{post.title}</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Nội dung bài viết */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center text-gray-500 mb-6">
            <div className="flex items-center">
              <i className="fas fa-user-md mr-2"></i>
              <span>{post.author}</span>
            </div>
            <span className="mx-3">•</span>
            <div className="flex items-center">
              <i className="far fa-calendar mr-2"></i>
              <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <span className="mx-3">•</span>
            <div className="flex items-center">
              <i className="far fa-clock mr-2"></i>
              <span>{post.readTime} phút đọc</span>
            </div>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden mb-6">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-600">Chia sẻ:</span>
                <div className="inline-flex space-x-2 ml-2">
                  <button className="text-blue-600 hover:text-blue-800"><i className="fab fa-facebook"></i></button>
                  <button className="text-blue-400 hover:text-blue-600"><i className="fab fa-twitter"></i></button>
                  <button className="text-red-600 hover:text-red-800"><i className="fab fa-pinterest"></i></button>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thẻ:</span>
                <Link href="/bai-viet/tag/dong-y" className="ml-2 text-green-600 hover:underline">Đông y</Link>,
                <Link href="/bai-viet/tag/benh-gan" className="ml-1 text-green-600 hover:underline">Bệnh gan</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Bài viết liên quan</h2>
            <div className="space-y-4">
              {post.relatedPosts.map(relatedPost => (
                <div key={relatedPost.id} className="flex gap-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/bai-viet/${toSlug(relatedPost.title)}-${relatedPost.id}`} className="hover:text-green-600">
                        {relatedPost.title}
                      </Link>
                    </h3>
                  </div>
                </div>
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
      </div>
    </div>
  );
};

export default BlogPostPage;