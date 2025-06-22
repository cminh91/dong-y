'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: string;
  parentId: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface CategoryFormProps {
  initialData?: CategoryFormData;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'ACTIVE',
    parentId: null,
    ...initialData
  });

  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      // Fetch only top-level categories to be parents
      const response = await fetch('/api/categories?parentId=null&limit=100');
      const data = await response.json();
      if (data.success) {
        // Exclude the current category from the list of potential parents
        const filteredCategories = initialData?.id
          ? data.data.categories.filter((c: Category) => c.id !== initialData.id)
          : data.data.categories;
        setParentCategories(filteredCategories);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: (!isEdit || !prev.slug) ? generateSlug(name) : prev.slug
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        ? `/api/categories/${initialData?.id}`
        : '/api/categories';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${isEdit ? 'Cập nhật' : 'Tạo'} danh mục thành công!`);
        router.push('/admin/categories');
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
        </div>

        {/* Danh mục cha */}
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục cha
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">— Danh mục gốc —</option>
            {parentCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
          folder="categories"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Link
          href="/admin/categories"
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