'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface PostCategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: string;
  sortOrder: number;
}

interface PostCategoryFormProps {
  initialData?: PostCategoryFormData;
  isEdit?: boolean;
}

export default function PostCategoryForm({ initialData, isEdit = false }: PostCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostCategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'ACTIVE',
    sortOrder: 0,
    ...initialData
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug only if not editing or slug is empty
      slug: (!isEdit || !prev.slug) ? generateSlug(name) : prev.slug
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      image: images[0] || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEdit 
        ? `/api/post-categories/${initialData?.id}`
        : '/api/post-categories';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || `${isEdit ? 'Cập nhật' : 'Tạo'} danh mục thành công!`);
        router.push('/admin/post-categories');
        router.refresh();
      } else {
        alert(data.error || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} danh mục`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} danh mục`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên danh mục */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên danh mục..."
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="slug-danh-muc"
          />
          <p className="mt-1 text-sm text-gray-500">
            URL thân thiện cho danh mục (tự động tạo từ tên)
          </p>
        </div>

        {/* Trạng thái */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>

        {/* Thứ tự */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự hiển thị
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            Số nhỏ hơn sẽ hiển thị trước (0, 1, 2, ...)
          </p>
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả danh mục
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mô tả ngắn về danh mục này..."
        />
      </div>

      {/* Ảnh đại diện */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh đại diện danh mục
        </label>
        <ImageUpload
          images={formData.image ? [formData.image] : []}
          onImagesChange={handleImageChange}
          maxImages={1}
          folder="post-categories"
        />
        <p className="mt-2 text-sm text-gray-500">
          Ảnh đại diện cho danh mục (không bắt buộc)
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Link
          href="/admin/post-categories"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Quay lại
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
            </>
          ) : (
            <>
              <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} mr-2`}></i>
              {isEdit ? 'Cập nhật danh mục' : 'Tạo danh mục'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
