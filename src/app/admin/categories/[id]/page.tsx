import CategoryForm, { CategoryData } from '@/components/admin/CategoryForm';
import { getCategoryById, getParentCategories, updateCategory } from '@/lib/queries';

const EditCategoryPage = async ({ params }: { params: { id: string } }) => {
  const category = await getCategoryById(params.id);
  const parentCategories = await getParentCategories(params.id);

  const handleUpdate = async (data: CategoryData) => {
    await updateCategory(params.id, data);
    return { success: true };
  };

  return (
    <CategoryForm
  initialValues={
    category
      ? {
          ...category,
          description: category.description ?? undefined,
          parentId: category.parentId ?? undefined,
          // icon: category.icon ?? undefined,
        }
      : undefined
  }
  parentCategories={parentCategories}
  onSubmit={handleUpdate}
/>
  );
};

export default EditCategoryPage;