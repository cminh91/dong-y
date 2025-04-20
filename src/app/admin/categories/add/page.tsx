"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CategoryForm, { CategoryData } from '@/components/admin/CategoryForm';
import { createCategory, getParentCategories } from '@/lib/queries';

type ParentCategory = {
  id: string;
  name: string;
};

export default function AddCategoryPage() {
  const router = useRouter();
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setIsLoading(true);
        const categories = await getParentCategories();
        setParentCategories(categories);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục cha:', error);
        toast.error('Lỗi khi tải danh sách danh mục cha');
      } finally {
        setIsLoading(false);
      }
    };
    fetchParentCategories();
  }, []);


  const handleCreate = async (data: CategoryData) => {
    try {
      console.log('Dữ liệu gửi vào Server Action:', data);
      const result = await createCategory({
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status,
        type: data.type, // Thêm lại trường type
        parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
      });

      if (result) {
        toast.success('Thêm danh mục thành công');
        router.push('/admin/categories'); // Chuyển hướng về trang danh sách
        return { success: true };
      } else {
         toast.error('Thêm danh mục thất bại');
         return { success: false };
      }

    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      toast.error('Lỗi khi tạo danh mục');
      return { success: false };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <CategoryForm
      onSubmit={handleCreate}
      parentCategories={parentCategories}
    />
  );
}