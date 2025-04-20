'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';

export interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  level: 1 | 2 | 3;
  type: 'SAN_PHAM' | 'TIN_TUC' | 'GIOI_THIEU';
  parentId?: string;
}

interface CategoryFormProps {
  onSubmit: (data: CategoryData) => Promise<{ success?: boolean }>; // Updated to handle async Server Action
  initialValues?: Partial<CategoryData>;
  parentCategories: { id: string; name: string }[];
}

const CategoryForm: FC<CategoryFormProps> = ({ onSubmit, initialValues, parentCategories }) => {
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [level, setLevel] = useState(initialValues?.level || 1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!name) {
      setNameError('Tên danh mục là bắt buộc');
      setIsSubmitting(false);
      return;
    } else {
      setNameError('');
    }

    if (!slug) {
      setSlugError('Slug là bắt buộc');
      setIsSubmitting(false);
      return;
    } else {
      setSlugError('');
    }

    try {
      const data: CategoryData = {
        name,
        slug,
        description: formData.get('description') as string || '',
        status: formData.get('status') as 'ACTIVE' | 'INACTIVE',
        level: parseInt(formData.get('level') as string, 10) as 1 | 2 | 3,
        type: formData.get('type') as 'SAN_PHAM' | 'TIN_TUC' | 'GIOI_THIEU',
        parentId: formData.get('parentId') as string || undefined,
      };

      await onSubmit(data);
      // Optionally, redirect or show success message
      // e.g., router.push('/admin/categories');
    } catch (error) {
      setSubmitError('Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin/categories" className="text-blue-600 hover:text-blue-800 mr-2">
          <i className="fas fa-arrow-left"></i> Quay lại
        </Link>
        <h1 className="text-2xl font-bold">
          {initialValues ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </h1>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Tên danh mục */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-bold mb-2">
            Tên danh mục:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={initialValues?.name}
            className="border rounded w-full py-2 px-3"
            required
          />
          {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
        </div>

        {/* Slug */}
        <div className="mb-4">
          <label htmlFor="slug" className="block text-sm font-bold mb-2">
            Slug:
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={initialValues?.slug}
            className="border rounded w-full py-2 px-3"
            required
          />
          {slugError && <p className="text-red-500 text-xs">{slugError}</p>}
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-bold mb-2">
            Mô tả:
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialValues?.description}
            className="border rounded w-full py-2 px-3"
          />
        </div>

        {/* Trạng thái */}
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-bold mb-2">
            Trạng thái:
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialValues?.status || 'ACTIVE'}
            className="border rounded w-full py-2 px-3"
          >
            <option value="ACTIVE">Hiển thị</option>
            <option value="INACTIVE">Ẩn</option>
          </select>
        </div>

        {/* Cấp danh mục */}
        <div className="mb-4">
          <label htmlFor="level" className="block text-sm font-bold mb-2">
            Cấp danh mục:
          </label>
          <select
            id="level"
            name="level"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) as 1 | 2 | 3)}
            className="border rounded w-full py-2 px-3"
          >
            <option value="1">Cấp 1</option>
            <option value="2">Cấp 2</option>
            <option value="3">Cấp 3</option>
          </select>
        </div>

        {/* Danh mục cha */}
        {(level === 2 || level === 3) && (
          <div className="mb-4">
            <label htmlFor="parentId" className="block text-sm font-bold mb-2">
              Danh mục cha:
            </label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={initialValues?.parentId}
              className="border rounded w-full py-2 px-3"
            >
              <option value="">-- Chọn danh mục cha --</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loại danh mục */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-bold mb-2">
            Loại danh mục:
          </label>
          <select
            id="type"
            name="type"
            defaultValue={initialValues?.type || 'SAN_PHAM'}
            className="border rounded w-full py-2 px-3"
          >
            <option value="SAN_PHAM">Sản phẩm</option>
            <option value="TIN_TUC">Tin tức</option>
            <option value="GIOI_THIEU">Giới thiệu</option>
          </select>
        </div>

        {/* Error message */}
        {submitError && (
          <div className="mb-4 text-red-500 text-sm">{submitError}</div>
        )}

        {/* Nút submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;