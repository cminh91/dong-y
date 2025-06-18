"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    status: 'ACTIVE'
  });

  // Get category ID from params
  useEffect(() => {
    const getCategoryId = async () => {
      const resolvedParams = await params;
      setCategoryId(resolvedParams.id);
    };
    getCategoryId();
  }, [params]);

  // Fetch category data and parent categories
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
      fetchParentCategories();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        const category = data.data;
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          parentId: category.parent?.id || '',
          status: category.status
        });
      } else {
        alert('Không tìm thấy danh mục');
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Có lỗi xảy ra khi tải dữ liệu danh mục');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories?parentId=null');
      const data = await response.json();
      if (data.success) {
        // Filter out current category to prevent circular reference
        const filteredCategories = data.data.categories.filter(
          (cat: Category) => cat.id !== categoryId
        );
        setParentCategories(filteredCategories);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

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
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
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
        alert('Cập nhật danh mục thành công!');
        router.push('/admin/categories');
      } else {
        alert(data.error || 'Có lỗi xảy ra khi cập nhật danh mục');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
              <Link
                href="/admin/categories"
                className="text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-arrow-left mr-2"></i>Quay lại
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tên danh mục *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="slug-danh-muc"
              />
              <p className="mt-1 text-sm text-gray-500">
                Slug sẽ được tự động tạo từ tên danh mục
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mô tả về danh mục"
              />
            </div>

            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                Danh mục cha
              </label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Danh mục gốc</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/categories"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
