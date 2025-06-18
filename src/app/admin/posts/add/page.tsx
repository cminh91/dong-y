"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TinyMCEEditor from '@/components/admin/TinyMCEEditor';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AddPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    status: 'DRAFT',
    authorName: '', // Tên tác giả do admin nhập
    categoryId: '',
    publishedAt: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/post-categories?limit=100');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.content || !formData.authorName) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        setLoading(false);
        return;
      }

      // Create post directly with author name
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          image: formData.image,
          status: formData.status,
          authorName: formData.authorName,
          categoryId: formData.categoryId || null,
          publishedAt: formData.status === 'PUBLISHED' ? (formData.publishedAt || new Date().toISOString()) : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Tạo bài viết thành công!');
        router.push('/admin/posts');
      } else {
        alert(data.error || 'Có lỗi xảy ra khi tạo bài viết');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/posts" className="text-blue-600 hover:text-blue-800 mr-2">
          <i className="fas fa-arrow-left"></i> Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Thêm bài viết mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tác giả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="Ví dụ: BS. Nguyễn Văn A"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đã đăng</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </div>

              {formData.status === 'PUBLISHED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng</label>
                  <input
                    type="datetime-local"
                    name="publishedAt"
                    value={formData.publishedAt}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mô tả ngắn về bài viết"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Nội dung bài viết</h2>
          </div>
          <div className="p-6">
            <TinyMCEEditor
              value={formData.content}
              onEditorChange={(content) => setFormData(prev => ({ ...prev, content }))}
              height={400}
              placeholder="Nhập nội dung bài viết..."
            />
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Hình ảnh đại diện</h2>
          </div>
          <div className="p-6">
            <ImageUpload
              images={formData.image ? [formData.image] : []}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, image: images[0] || '' }))}
              maxImages={1}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/posts"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tạo...
              </>
            ) : (
              'Tạo bài viết'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
