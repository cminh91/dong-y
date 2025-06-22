"use client";

import CategoryForm from '@/components/admin/CategoryForm';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: string;
    parentId: string | null;
    _count: {
      products: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface EditCategoryClientProps {
    category: Category;
}

export default function EditCategoryClient({ category }: EditCategoryClientProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Thông tin danh mục</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>
              <i className="fas fa-box-open mr-1"></i>
              {category._count.products} sản phẩm
            </span>
            <span>
              <i className="fas fa-calendar mr-1"></i>
              Tạo: {new Date(category.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <CategoryForm 
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            status: category.status,
            parentId: category.parentId
          }}
          isEdit={true}
        />
      </div>
    </div>
  );
}