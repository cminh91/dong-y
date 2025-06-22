
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditCategoryClient from './EditCategoryClient';

export const metadata: Metadata = {
  title: 'Chỉnh sửa danh mục sản phẩm - Admin',
  description: 'Chỉnh sửa thông tin danh mục sản phẩm',
};

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

async function fetchCategory(id: string): Promise<Category | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
  const url = `${fullBaseUrl}/api/categories/${id}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 0 } // No cache for edit page
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await fetchCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa danh mục sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Cập nhật thông tin danh mục: <strong>{category.name}</strong>
          </p>
        </div>
      </div>
      <EditCategoryClient category={category} />
    </div>
  );
}
