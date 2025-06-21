import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HTMLContent from '@/components/common/HTMLContent';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
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

// Fetch post from API
async function fetchPost(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = `${fullBaseUrl}/api/posts/by-slug/${slug}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store' // Always fetch fresh data for SSR
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Generate metadata
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPost(slug);
  
  if (!data || !data.post) {
    return {
      title: 'Bài viết không tìm thấy - Đông Y Pharmacy',
    };
  }

  const post = data.post;
  
  return {
    title: `${post.title} - Đông Y Pharmacy`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const data = await fetchPost(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, relatedPosts } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-green-600">Trang chủ</Link></li>
            <li><i className="fas fa-chevron-right text-xs"></i></li>
            <li><Link href="/bai-viet" className="hover:text-green-600">Bài viết</Link></li>
            <li><i className="fas fa-chevron-right text-xs"></i></li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        {/* Post Header */}
        <header className="mb-8">
          {post.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <i className="fas fa-folder mr-2"></i>
                {post.category.name}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 mb-6">
            <div className="flex items-center mr-6">
              <i className="fas fa-user-md mr-2"></i>
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center">
              <i className="far fa-calendar mr-2"></i>
              <span>
                {post.publishedAt 
                  ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                  : new Date(post.createdAt).toLocaleDateString('vi-VN')
                }
              </span>
            </div>
          </div>

          {post.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Post Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <HTMLContent content={post.content} />
        </article>

        {/* Share Buttons */}
        <div className="border-t border-b border-gray-200 py-6 mb-12">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chia sẻ bài viết</h3>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <i className="fab fa-facebook-f mr-2"></i>
                Facebook
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500">
                <i className="fab fa-twitter mr-2"></i>
                Twitter
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Author Info */}
        {/* <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {post.authorName.charAt(0)}
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">{post.authorName}</h4>
              <p className="text-gray-600 mt-1">
                Chuyên gia y học cổ truyền với nhiều năm kinh nghiệm trong lĩnh vực dược liệu và điều trị bằng phương pháp tự nhiên.
              </p>
            </div>
          </div>
        </div> */}

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6">Bài viết liên quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost: Post) => (
                <article key={relatedPost.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={relatedPost.image || '/images/placeholder.png'}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">
                      <Link href={`/bai-viet/${relatedPost.slug}`} className="hover:text-green-600">
                        {relatedPost.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-500">
                      <i className="far fa-calendar mr-1"></i>
                      {relatedPost.publishedAt 
                        ? new Date(relatedPost.publishedAt).toLocaleDateString('vi-VN')
                        : new Date(relatedPost.createdAt).toLocaleDateString('vi-VN')
                      }
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
