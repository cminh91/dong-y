"use client";

import CategoryForm, { CategoryData } from '@/components/admin/CategoryForm';
import { createCategory } from '@/lib/queries';

export default function AddCategoryPage() {
  const handleCreate = async (data: CategoryData) => {
    try {
      console.log('Dữ liệu gửi vào Prisma:', data);
      await createCategory({
        name: data.name,
        slug: data.slug,
        description: data.description,
        status: data.status,
        // type: data.type, // Removed as it does not exist in CategoryCreateInput
        parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
      });
      return { success: true };
    } catch (error) {
      console.error('Lỗi Prisma:', error);
      return { success: false };
    }
  };

  return (
    <CategoryForm
      onSubmit={handleCreate}
      parentCategories={[]}
    />
  );
}